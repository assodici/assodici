#!/usr/bin/env python3
"""RNA Waldec → Supabase Postgres sync.

Architecture:
  data.gouv.fr (Parquet) → DuckDB stream → psycopg2 chunked COPY → staging table
  → two-connection chunked COPY → production → ingestion_runs audit log

Every COPY statement is capped at CHUNK_ROWS rows to stay under pooler statement
timeouts. The staging→prod swap uses two connections so each COPY chunk commits
on the write connection without invalidating the server-side read cursor.
"""

import csv
import io
import itertools
import os
import sys
import tempfile
import urllib.parse
from datetime import timezone
from email.utils import parsedate_to_datetime
from typing import Iterator

import duckdb
import psycopg2
import requests

WALDEC_RESOURCE_ID = "cc7b8f0c-45ea-4444-8b55-55d30bc34ac5"
DATA_GOUV_REDIRECT = f"https://www.data.gouv.fr/api/1/datasets/r/{WALDEC_RESOURCE_ID}"
MIN_ROW_COUNT = 1_000_000
CHUNK_ROWS = 50_000

COLUMNS = [
    "id", "id_ex", "siret", "rup_mi", "gestion",
    "date_creat", "date_decla", "date_publi", "date_disso", "maj_time",
    "nature", "groupement", "position", "objet_social1", "objet_social2",
    "titre", "titre_court", "objet",
    "adrs_complement", "adrs_numvoie", "adrs_repetition", "adrs_typevoie",
    "adrs_libvoie", "adrs_distrib", "adrs_codeinsee", "adrs_codepostal", "adrs_libcommune",
    "adrg_declarant", "adrg_complemid", "adrg_complemgeo", "adrg_libvoie",
    "adrg_distrib", "adrg_codepostal", "adrg_achemine", "adrg_pays",
    "dir_civilite", "siteweb", "publiweb", "observation",
]

COLS_SQL = ", ".join(COLUMNS)


def connect_pg(db_url: str):
    p = urllib.parse.urlparse(db_url)
    return psycopg2.connect(
        host=p.hostname,
        port=p.port or 5432,
        dbname=p.path.lstrip("/") or "postgres",
        user=p.username,
        password=p.password,
        keepalives=1,
        keepalives_idle=10,
        keepalives_interval=5,
        keepalives_count=5,
        connect_timeout=30,
    )


def fetch_metadata() -> tuple[str, str | None, int]:
    resp = requests.get(DATA_GOUV_REDIRECT, allow_redirects=False, timeout=30)
    resp.raise_for_status()
    download_url = resp.headers["Location"]
    # object.files.data.gouv.fr rejects HEAD — streaming GET, read headers only
    with requests.get(download_url, stream=True, timeout=120) as r:
        r.raise_for_status()
        raw_modified = r.headers.get("Last-Modified")
        filesize = int(r.headers.get("Content-Length", 0))
    last_modified = (
        parsedate_to_datetime(raw_modified).astimezone(timezone.utc).isoformat()
        if raw_modified
        else None
    )
    return download_url, last_modified, filesize


def download_parquet(url: str, path: str) -> None:
    with requests.get(url, stream=True, timeout=600) as r:
        r.raise_for_status()
        with open(path, "wb") as f:
            for chunk in r.iter_content(chunk_size=8 * 1024 * 1024):
                f.write(chunk)


def _copy_iter_chunks(pg, row_iter: Iterator, table: str, label: str) -> int:
    """COPY rows from any iterator into table, one transaction per CHUNK_ROWS rows."""
    copy_sql = f"COPY {table} ({COLS_SQL}) FROM STDIN WITH (FORMAT CSV, NULL '')"
    total = chunk_n = 0
    while True:
        batch = list(itertools.islice(row_iter, CHUNK_ROWS))
        if not batch:
            break
        buf = io.StringIO()
        w = csv.writer(buf, lineterminator="\n")
        for row in batch:
            w.writerow(["" if v is None else v for v in row])
        buf.seek(0)
        with pg.cursor() as cur:
            cur.copy_expert(copy_sql, buf)
        pg.commit()
        total += len(batch)
        chunk_n += 1
        print(f"  {label} chunk {chunk_n} ({total:,} rows)")
    return total


def stream_parquet_to_staging(parquet_path: str, pg) -> int:
    duck = duckdb.connect()
    parquet_cols = {
        row[0]
        for row in duck.execute(
            f"DESCRIBE SELECT * FROM parquet_scan('{parquet_path}') LIMIT 0"
        ).fetchall()
    }
    missing = [c for c in COLUMNS if c not in parquet_cols]
    if missing:
        print(f"WARNING: Parquet missing columns (will be NULL): {missing}", file=sys.stderr)

    col_selects = [col if col in parquet_cols else "NULL" for col in COLUMNS]
    result = duck.execute(f"""
        SELECT {", ".join(col_selects)}
        FROM parquet_scan('{parquet_path}')
        WHERE titre IS NOT NULL
    """)

    def _duckdb_iter():
        while True:
            batch = result.fetchmany(CHUNK_ROWS)
            if not batch:
                return
            yield from batch

    total = _copy_iter_chunks(pg, _duckdb_iter(), "associations_staging", "staging")
    duck.close()
    return total


def swap_staging_to_prod(db_url: str) -> int:
    """Stream staging → production using two separate connections.

    read_pg holds a server-side cursor that stays open across multiple fetchmany
    calls. write_pg commits after each COPY chunk. Using two connections avoids
    committing on read_pg, which would invalidate the open cursor.
    """
    read_pg = connect_pg(db_url)
    write_pg = connect_pg(db_url)
    try:
        read_cur = read_pg.cursor("stream_staging")
        read_cur.execute(f"SELECT {COLS_SQL} FROM associations_staging")

        def _pg_iter():
            while True:
                batch = read_cur.fetchmany(CHUNK_ROWS)
                if not batch:
                    return
                yield from batch

        total = _copy_iter_chunks(write_pg, _pg_iter(), "associations", "swap")
        read_cur.close()
    finally:
        read_pg.close()
        write_pg.close()
    return total


def log_run(db_url: str, status: str, last_modified, filesize: int, **kwargs) -> None:
    extra_cols = list(kwargs.keys())
    extra_vals = list(kwargs.values())
    cols = ", ".join(["resource_id", "status", "last_modified", "filesize"] + extra_cols)
    placeholders = ", ".join(["%s"] * (4 + len(extra_cols)))
    try:
        lg = connect_pg(db_url)
        with lg.cursor() as cur:
            cur.execute(
                f"INSERT INTO ingestion_runs ({cols}) VALUES ({placeholders})",
                [WALDEC_RESOURCE_ID, status, last_modified, filesize] + extra_vals,
            )
        lg.commit()
        lg.close()
    except Exception as err:
        print(f"WARNING: could not write ingestion_runs: {err}", file=sys.stderr)


def main() -> None:
    db_url = os.environ["SUPABASE_DB_URL"]
    parquet_path = None

    print("Fetching metadata...")
    download_url, last_modified, filesize = fetch_metadata()
    print(f"  last_modified={last_modified}  filesize={filesize:,}")

    pg = connect_pg(db_url)
    with pg.cursor() as cur:
        cur.execute(
            "SELECT last_modified, filesize FROM ingestion_runs "
            "WHERE resource_id = %s AND status = 'success' "
            "ORDER BY imported_at DESC LIMIT 1",
            (WALDEC_RESOURCE_ID,),
        )
        prev = cur.fetchone()
    pg.commit()
    pg.close()

    if prev and str(prev[0]) == last_modified and prev[1] == filesize:
        print("Dataset unchanged — logging skip.")
        log_run(db_url, "skipped", last_modified, filesize)
        return

    try:
        with tempfile.NamedTemporaryFile(suffix=".parquet", delete=False) as pf:
            parquet_path = pf.name

        print(f"Downloading {filesize / 1e6:.1f} MB...")
        download_parquet(download_url, parquet_path)

        # Load staging
        pg = connect_pg(db_url)
        print("Preparing staging table...")
        with pg.cursor() as cur:
            cur.execute(
                "DROP TABLE IF EXISTS associations_staging; "
                "CREATE TABLE associations_staging "
                "(LIKE associations INCLUDING DEFAULTS);"
            )
        pg.commit()

        print(f"Streaming Parquet → staging ({CHUNK_ROWS:,} rows/chunk)...")
        staged = stream_parquet_to_staging(parquet_path, pg)
        pg.close()
        print(f"  staged: {staged:,}")

        if staged < MIN_ROW_COUNT:
            raise ValueError(f"Staged row count {staged} below minimum {MIN_ROW_COUNT}")

        # Validate
        pg = connect_pg(db_url)
        with pg.cursor() as cur:
            cur.execute("SELECT count(*) FROM associations_staging")
            db_staged = cur.fetchone()[0]
        if db_staged != staged:
            raise ValueError(f"Staging count mismatch: Python={staged}, DB={db_staged}")

        # TRUNCATE production then swap
        print("Truncating production table...")
        with pg.cursor() as cur:
            cur.execute("TRUNCATE associations")
        pg.commit()
        pg.close()

        print(f"Copying staging → production ({CHUNK_ROWS:,} rows/chunk)...")
        inserted = swap_staging_to_prod(db_url)
        print(f"  inserted: {inserted:,}")

        # Cleanup
        pg = connect_pg(db_url)
        with pg.cursor() as cur:
            cur.execute("DROP TABLE IF EXISTS associations_staging")
        pg.commit()
        pg.close()

        log_run(db_url, "success", last_modified, filesize, row_count=inserted)
        print(f"Done. {inserted:,} rows in production.")

    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        log_run(db_url, "error", last_modified, filesize, error_message=str(e))
        raise

    finally:
        if parquet_path:
            try:
                os.unlink(parquet_path)
            except OSError:
                pass


if __name__ == "__main__":
    main()
