#!/usr/bin/env python3
"""RNA Waldec → Supabase Postgres sync via DuckDB + psycopg2 chunked COPY."""

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
CHUNK_ROWS = 50_000  # rows per COPY transaction — keeps each statement under ~10s

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

COPY_SQL = (
    f"COPY associations ({', '.join(COLUMNS)}) "
    "FROM STDIN WITH (FORMAT CSV, NULL '')"
)


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
    head = requests.head(download_url, timeout=30)
    raw_modified = head.headers.get("Last-Modified")
    filesize = int(head.headers.get("Content-Length", 0))
    last_modified = (
        parsedate_to_datetime(raw_modified).astimezone(timezone.utc).isoformat()
        if raw_modified else None
    )
    return download_url, last_modified, filesize


def download_parquet(url: str, path: str) -> None:
    with requests.get(url, stream=True, timeout=600) as r:
        r.raise_for_status()
        with open(path, "wb") as f:
            for chunk in r.iter_content(chunk_size=8 * 1024 * 1024):
                f.write(chunk)


def parquet_to_csv(parquet_path: str, csv_path: str) -> int:
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

    row_count: int = duck.execute(
        f"SELECT count(*) FROM parquet_scan('{parquet_path}')"
    ).fetchone()[0]

    col_selects = []
    for col in COLUMNS:
        if col not in parquet_cols:
            col_selects.append("NULL")
        elif col == "maj_time":
            col_selects.append("TRY_CAST(maj_time AS TIMESTAMPTZ)")
        else:
            col_selects.append(col)

    duck.execute(f"""
        COPY (
            SELECT {', '.join(col_selects)}
            FROM parquet_scan('{parquet_path}')
            WHERE titre IS NOT NULL
        )
        TO '{csv_path}' (FORMAT CSV, HEADER false, NULL '')
    """)
    duck.close()
    return row_count


def copy_in_chunks(pg, csv_path: str) -> None:
    buf = io.StringIO()
    n = chunk_n = 0
    with open(csv_path) as f:
        for line in f:
            buf.write(line)
            n += 1
            if n == CHUNK_ROWS:
                buf.seek(0)
                with pg.cursor() as cur:
                    cur.copy_expert(COPY_SQL, buf)
                pg.commit()
                chunk_n += 1
                print(f"  chunk {chunk_n} ({chunk_n * CHUNK_ROWS:,} rows)")
                buf = io.StringIO()
                n = 0
    if n:
        buf.seek(0)
        with pg.cursor() as cur:
            cur.copy_expert(COPY_SQL, buf)
        pg.commit()
        chunk_n += 1
        print(f"  chunk {chunk_n} final ({n:,} rows)")


def log_run(db_url: str, status: str, **kwargs) -> None:
    fields = {"resource_id": WALDEC_RESOURCE_ID, "status": status, **kwargs}
    cols = ", ".join(fields)
    placeholders = ", ".join(["%s"] * len(fields))
    try:
        pg = connect_pg(db_url)
        with pg.cursor() as cur:
            cur.execute(
                f"INSERT INTO ingestion_runs ({cols}) VALUES ({placeholders})",
                list(fields.values()),
            )
        pg.commit()
        pg.close()
    except Exception as log_err:
        print(f"WARNING: failed to log run: {log_err}", file=sys.stderr)


def main() -> None:
    db_url = os.environ["SUPABASE_DB_URL"]
    parquet_path = csv_path = None

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

    if prev and str(prev[0]) == last_modified and prev[1] == filesize:
        print("Dataset unchanged — logging skip.")
        log_run(db_url, "skipped", last_modified=last_modified, filesize=filesize)
        pg.close()
        return

    pg.close()

    try:
        with tempfile.NamedTemporaryFile(suffix=".parquet", delete=False) as pf:
            parquet_path = pf.name
        with tempfile.NamedTemporaryFile(suffix=".csv", delete=False) as cf:
            csv_path = cf.name

        print(f"Downloading {filesize / 1e6:.1f} MB...")
        download_parquet(download_url, parquet_path)

        print("Transforming Parquet → CSV...")
        row_count = parquet_to_csv(parquet_path, csv_path)
        print(f"  rows: {row_count:,}")
        if row_count < MIN_ROW_COUNT:
            raise ValueError(f"Row count {row_count} below minimum {MIN_ROW_COUNT}")

        print("Truncating associations...")
        pg = connect_pg(db_url)
        with pg.cursor() as cur:
            cur.execute("TRUNCATE associations")
        pg.commit()

        print(f"Loading into Postgres ({CHUNK_ROWS:,} rows/chunk)...")
        copy_in_chunks(pg, csv_path)
        pg.close()

        log_run(db_url, "success",
                last_modified=last_modified, filesize=filesize, row_count=row_count)
        print(f"Done. {row_count:,} rows ingested.")

    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        log_run(db_url, "error",
                last_modified=last_modified, filesize=filesize, error_message=str(e))
        raise

    finally:
        for path in filter(None, [parquet_path, csv_path]):
            try:
                os.unlink(path)
            except OSError:
                pass


if __name__ == "__main__":
    main()
