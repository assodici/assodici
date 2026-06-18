#!/usr/bin/env python3
"""RNA Waldec → Supabase Postgres sync via DuckDB + psycopg2 COPY."""

import os
import sys
import tempfile
from datetime import timezone
from email.utils import parsedate_to_datetime

import duckdb
import psycopg2
import requests

WALDEC_RESOURCE_ID = "cc7b8f0c-45ea-4444-8b55-55d30bc34ac5"
DATA_GOUV_REDIRECT = f"https://www.data.gouv.fr/api/1/datasets/r/{WALDEC_RESOURCE_ID}"
MIN_ROW_COUNT = 1_000_000

# Ordered to match the COPY statement below
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


def main() -> None:
    db_url = os.environ["SUPABASE_DB_URL"]
    parquet_path = csv_path = None

    print("Fetching metadata...")
    download_url, last_modified, filesize = fetch_metadata()
    print(f"  last_modified={last_modified}  filesize={filesize:,}")

    pg = psycopg2.connect(db_url)
    try:
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
            with pg.cursor() as cur:
                cur.execute(
                    "INSERT INTO ingestion_runs (resource_id, last_modified, filesize, status) "
                    "VALUES (%s, %s, %s, 'skipped')",
                    (WALDEC_RESOURCE_ID, last_modified, filesize),
                )
            pg.commit()
            return

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

        print("Loading into Postgres (TRUNCATE + COPY)...")
        with pg.cursor() as cur:
            cur.execute("TRUNCATE associations")
            with open(csv_path) as f:
                cur.copy_expert(
                    f"COPY associations ({', '.join(COLUMNS)}) "
                    "FROM STDIN WITH (FORMAT CSV, NULL '')",
                    f,
                )
        pg.commit()

        with pg.cursor() as cur:
            cur.execute(
                "INSERT INTO ingestion_runs "
                "(resource_id, last_modified, filesize, row_count, status) "
                "VALUES (%s, %s, %s, %s, 'success')",
                (WALDEC_RESOURCE_ID, last_modified, filesize, row_count),
            )
        pg.commit()
        print(f"Done. {row_count:,} rows ingested.")

    except Exception as e:
        pg.rollback()
        with pg.cursor() as cur:
            cur.execute(
                "INSERT INTO ingestion_runs "
                "(resource_id, last_modified, filesize, status, error_message) "
                "VALUES (%s, %s, %s, 'error', %s)",
                (WALDEC_RESOURCE_ID, last_modified, filesize, str(e)),
            )
        pg.commit()
        print(f"ERROR: {e}", file=sys.stderr)
        raise

    finally:
        pg.close()
        for path in filter(None, [parquet_path, csv_path]):
            try:
                os.unlink(path)
            except OSError:
                pass


if __name__ == "__main__":
    main()
