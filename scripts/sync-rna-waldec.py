#!/usr/bin/env python3
"""RNA Waldec → Supabase Postgres sync.

Architecture:
  data.gouv.fr (Parquet) → DuckDB stream → psycopg2 chunked COPY → associations_new
  → atomic RENAME swap into associations → search table rebuilt the same way
  → ingestion_runs audit log

Every COPY statement is capped at CHUNK_ROWS rows to stay under pooler statement
timeouts. Each table is built fresh under a `_new` name (unindexed, for fast
bulk load) and swapped into place with a single-transaction RENAME, so the
live table is never truncated and readers never see a partial/empty table.
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


def _copy_iter_chunks(
    pg, row_iter: Iterator, table: str, label: str, cols: str = COLS_SQL
) -> int:
    """COPY rows from any iterator into table, one transaction per CHUNK_ROWS rows."""
    copy_sql = f"COPY {table} ({cols}) FROM STDIN WITH (FORMAT CSV, NULL '')"
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


def stream_parquet_to_table(parquet_path: str, pg, table: str) -> int:
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

    total = _copy_iter_chunks(pg, _duckdb_iter(), table, "load")
    duck.close()
    return total


def _swap_into_place(pg, new_table: str, live_table: str) -> None:
    """Atomically replace live_table's contents with new_table via RENAME.

    new_table must already carry the constraints/indexes it needs to go live.
    Adds the "public read" policy and anon/authenticated SELECT grant (RLS
    itself is auto-enabled on CREATE TABLE by the ensure_rls event trigger),
    then swaps names in one transaction. The old table is dropped afterward.
    This is a single fast DDL operation — readers never see a truncated or
    partially-loaded table.
    """
    with pg.cursor() as cur:
        cur.execute(f'CREATE POLICY "public read" ON {new_table} FOR SELECT USING (true)')
        cur.execute(f"GRANT SELECT ON {new_table} TO anon, authenticated")
    pg.commit()

    with pg.cursor() as cur:
        cur.execute(f"DROP TABLE IF EXISTS {live_table}_old")
        cur.execute(f"ALTER TABLE {live_table} RENAME TO {live_table}_old")
        cur.execute(f"ALTER TABLE {new_table} RENAME TO {live_table}")
    pg.commit()

    with pg.cursor() as cur:
        cur.execute(f"DROP TABLE {live_table}_old")
    pg.commit()


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


_SEARCH_COLS_SQL = "id, titre, objet, adrs_libcommune, adrs_codepostal"


def _rebuild_search_table(db_url: str) -> int:
    """Rebuild associations_search from fresh associations data.

    Builds associations_search_new from scratch (unindexed, for fast bulk
    load via the same two-connection streaming pattern as the main table),
    adds its primary key and GIN indexes, then swaps it into place with
    _swap_into_place. Readers never see a truncated or unindexed search table.
    """
    pg = connect_pg(db_url)
    with pg.cursor() as cur:
        cur.execute(
            "DROP TABLE IF EXISTS associations_search_new; "
            "CREATE TABLE associations_search_new (LIKE associations_search INCLUDING GENERATED)"
        )
    pg.commit()
    pg.close()

    read_pg = connect_pg(db_url)
    write_pg = connect_pg(db_url)
    try:
        read_cur = read_pg.cursor("stream_search_rebuild")
        read_cur.execute(f"SELECT {_SEARCH_COLS_SQL} FROM associations")

        def _pg_iter():
            while True:
                batch = read_cur.fetchmany(CHUNK_ROWS)
                if not batch:
                    return
                yield from batch

        total = _copy_iter_chunks(
            write_pg, _pg_iter(), "associations_search_new", "search", _SEARCH_COLS_SQL
        )
        read_cur.close()
    finally:
        read_pg.close()
        write_pg.close()

    pg = connect_pg(db_url)
    with pg.cursor() as cur:
        print("  Adding primary key...")
        cur.execute("ALTER TABLE associations_search_new ADD PRIMARY KEY (id)")
        print("  Building search_vector GIN index...")
        cur.execute(
            "CREATE INDEX associations_search_new_fts "
            "ON public.associations_search_new USING gin(search_vector)"
        )
        print("  Building trigram GIN index...")
        cur.execute(
            "CREATE INDEX associations_search_new_trgm "
            "ON public.associations_search_new USING gin(titre gin_trgm_ops)"
        )
        print("  Building geo lookup indexes...")
        cur.execute(
            "CREATE INDEX associations_search_new_codepostal "
            "ON public.associations_search_new (adrs_codepostal)"
        )
        cur.execute(
            "CREATE INDEX associations_search_new_libcommune_lower "
            "ON public.associations_search_new (lower(adrs_libcommune))"
        )
    pg.commit()

    print("  Swapping search table into place...")
    _swap_into_place(pg, "associations_search_new", "associations_search")
    with pg.cursor() as cur:
        cur.execute(
            "ALTER TABLE associations_search "
            "RENAME CONSTRAINT associations_search_new_pkey TO associations_search_pkey"
        )
        cur.execute("ALTER INDEX associations_search_new_fts RENAME TO associations_search_fts")
        cur.execute("ALTER INDEX associations_search_new_trgm RENAME TO associations_search_trgm")
        cur.execute(
            "ALTER INDEX associations_search_new_codepostal "
            "RENAME TO associations_search_codepostal_idx"
        )
        cur.execute(
            "ALTER INDEX associations_search_new_libcommune_lower "
            "RENAME TO associations_search_libcommune_lower_idx"
        )
    pg.commit()
    pg.close()
    return total


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

        # Build associations_new (unindexed, for fast bulk load)
        pg = connect_pg(db_url)
        print("Preparing associations_new table...")
        with pg.cursor() as cur:
            cur.execute(
                "DROP TABLE IF EXISTS associations_new; "
                "CREATE TABLE associations_new "
                "(LIKE associations INCLUDING DEFAULTS);"
            )
        pg.commit()

        print(f"Streaming Parquet → associations_new ({CHUNK_ROWS:,} rows/chunk)...")
        inserted = stream_parquet_to_table(parquet_path, pg, "associations_new")
        pg.close()
        print(f"  loaded: {inserted:,}")

        if inserted < MIN_ROW_COUNT:
            raise ValueError(f"Loaded row count {inserted} below minimum {MIN_ROW_COUNT}")

        # Validate
        pg = connect_pg(db_url)
        with pg.cursor() as cur:
            cur.execute("SELECT count(*) FROM associations_new")
            db_count = cur.fetchone()[0]
        if db_count != inserted:
            raise ValueError(f"Row count mismatch: Python={inserted}, DB={db_count}")

        print("Adding primary key to associations_new...")
        with pg.cursor() as cur:
            cur.execute("ALTER TABLE associations_new ADD PRIMARY KEY (id)")
        pg.commit()

        print("Swapping associations_new into place...")
        _swap_into_place(pg, "associations_new", "associations")
        with pg.cursor() as cur:
            cur.execute(
                "ALTER TABLE associations "
                "RENAME CONSTRAINT associations_new_pkey TO associations_pkey"
            )
        pg.commit()
        pg.close()

        # Rebuild dedicated search table the same way (build fresh, then swap)
        print("Rebuilding search table (this takes a few minutes)...")
        search_rows = _rebuild_search_table(db_url)
        print(f"  search table: {search_rows:,} rows, indexes rebuilt.")

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
