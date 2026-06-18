#!/usr/bin/env python3
"""RNA Waldec → Supabase Postgres sync.

Architecture:
  data.gouv.fr (Parquet) → DuckDB (stream) → psycopg2 chunked COPY → staging table
  → atomic swap (TRUNCATE prod + INSERT from staging) → ingestion_runs audit log

No intermediate files. Staging ensures prod table is never partially populated.
"""

import csv
import io
import os
import sys
import tempfile
import urllib.parse
from datetime import timezone
from email.utils import parsedate_to_datetime

import duckdb
import psycopg2
import requests

WALDEC_RESOURCE_ID = "cc7b8f0c-45ea-4444-8b55-55d30bc34ac5"
DATA_GOUV_REDIRECT = f"https://www.data.gouv.fr/api/1/datasets/r/{WALDEC_RESOURCE_ID}"
MIN_ROW_COUNT = 1_000_000
CHUNK_ROWS = 50_000  # rows per COPY transaction — each completes in <10s

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
    # HEAD not supported by object.files.data.gouv.fr — use streaming GET,
    # read only headers, close without consuming body
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


def stream_parquet_to_staging(parquet_path: str, pg) -> int:
    """Stream Parquet rows via DuckDB → psycopg2 chunked COPY into associations_staging.

    Returns the number of rows inserted.
    """
    duck = duckdb.connect()

    parquet_cols = {
        row[0]
        for row in duck.execute(
            f"DESCRIBE SELECT * FROM parquet_scan('{parquet_path}') LIMIT 0"
        ).fetchall()
    }
    missing = [c for c in COLUMNS if c not in parquet_cols]
    if missing:
        print(f"WARNING: Parquet missing columns (will use NULL): {missing}", file=sys.stderr)

    # All columns passed as strings — Postgres COPY handles type coercion
    col_selects = [col if col in parquet_cols else "NULL" for col in COLUMNS]

    result = duck.execute(f"""
        SELECT {', '.join(col_selects)}
        FROM parquet_scan('{parquet_path}')
        WHERE titre IS NOT NULL
    """)

    copy_sql = f"COPY associations_staging ({COLS_SQL}) FROM STDIN WITH (FORMAT CSV, NULL '')"
    total = chunk_n = 0

    while True:
        batch = result.fetchmany(CHUNK_ROWS)
        if not batch:
            break

        buf = io.StringIO()
        writer = csv.writer(buf, lineterminator="\n")
        for row in batch:
            writer.writerow(["" if v is None else v for v in row])

        buf.seek(0)
        with pg.cursor() as cur:
            cur.copy_expert(copy_sql, buf)
        pg.commit()

        total += len(batch)
        chunk_n += 1
        print(f"  chunk {chunk_n} ({total:,} rows)")

    duck.close()
    return total


def log_run(db_url: str, status: str, last_modified, filesize: int, **kwargs) -> None:
    extra_cols = list(kwargs.keys())
    extra_vals = list(kwargs.values())
    cols = ", ".join(["resource_id", "status", "last_modified", "filesize"] + extra_cols)
    placeholders = ", ".join(["%s"] * (4 + len(extra_cols)))
    try:
        pg = connect_pg(db_url)
        with pg.cursor() as cur:
            cur.execute(
                f"INSERT INTO ingestion_runs ({cols}) VALUES ({placeholders})",
                [WALDEC_RESOURCE_ID, status, last_modified, filesize] + extra_vals,
            )
        pg.commit()
        pg.close()
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

        pg = connect_pg(db_url)

        print("Preparing staging table...")
        with pg.cursor() as cur:
            cur.execute(
                "DROP TABLE IF EXISTS associations_staging; "
                "CREATE TABLE associations_staging (LIKE associations INCLUDING DEFAULTS);"
            )
        pg.commit()

        print(f"Streaming into staging ({CHUNK_ROWS:,} rows/chunk)...")
        row_count = stream_parquet_to_staging(parquet_path, pg)
        print(f"  total: {row_count:,} rows")

        if row_count < MIN_ROW_COUNT:
            raise ValueError(f"Row count {row_count} below minimum {MIN_ROW_COUNT}")

        print("Validating staging row count...")
        with pg.cursor() as cur:
            cur.execute("SELECT count(*) FROM associations_staging")
            staged = cur.fetchone()[0]
        if staged != row_count:
            raise ValueError(f"Staging count mismatch: expected {row_count}, got {staged}")

        print("Swapping staging → production...")
        with pg.cursor() as cur:
            cur.execute("TRUNCATE associations")
        pg.commit()
        with pg.cursor() as cur:
            cur.execute("INSERT INTO associations SELECT * FROM associations_staging")
        pg.commit()

        print("Cleaning up staging table...")
        with pg.cursor() as cur:
            cur.execute("DROP TABLE IF EXISTS associations_staging")
        pg.commit()
        pg.close()

        log_run(db_url, "success", last_modified, filesize, row_count=row_count)
        print(f"Done. {row_count:,} rows in production.")

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
