#!/usr/bin/env python3
"""Download and analyse the RNA Waldec Parquet for data quality issues."""

import os
import tempfile
import requests
import duckdb

WALDEC_RESOURCE_ID = "cc7b8f0c-45ea-4444-8b55-55d30bc34ac5"
DATA_GOUV_REDIRECT = f"https://www.data.gouv.fr/api/1/datasets/r/{WALDEC_RESOURCE_ID}"


def download(path: str) -> None:
    resp = requests.get(DATA_GOUV_REDIRECT, allow_redirects=False, timeout=30)
    resp.raise_for_status()
    url = resp.headers["Location"]
    size = int(requests.head(url, timeout=30).headers.get("Content-Length", 0))
    print(f"Downloading {size / 1e6:.1f} MB...")
    with requests.get(url, stream=True, timeout=600) as r:
        r.raise_for_status()
        with open(path, "wb") as f:
            for chunk in r.iter_content(chunk_size=8 * 1024 * 1024):
                f.write(chunk)


def analyse(path: str) -> None:
    duck = duckdb.connect()
    duck.execute(f"CREATE VIEW waldec AS SELECT * FROM parquet_scan('{path}')")

    # Schema
    print("\n=== SCHEMA ===")
    for row in duck.execute("DESCRIBE waldec").fetchall():
        print(f"  {row[0]:30s} {row[1]}")

    # Row count + position distribution
    print("\n=== ROW COUNT & POSITION ===")
    total = duck.execute("SELECT count(*) FROM waldec").fetchone()[0]
    print(f"  total rows: {total:,}")
    for row in duck.execute(
        "SELECT position, count(*) FROM waldec GROUP BY position ORDER BY 2 DESC"
    ).fetchall():
        print(f"  position={row[0]!r:5s}  {row[1]:>10,}")

    # Null rates for every column
    print("\n=== NULL RATES (columns with any nulls) ===")
    cols = [r[0] for r in duck.execute("DESCRIBE waldec").fetchall()]
    for col in cols:
        null_count = duck.execute(
            f"SELECT count(*) FROM waldec WHERE {col} IS NULL"
        ).fetchone()[0]
        if null_count > 0:
            print(f"  {col:30s}  {null_count:>10,}  ({null_count / total * 100:.1f}%)")

    # Sample rows with null titre
    print("\n=== SAMPLE ROWS WITH NULL titre (first 10) ===")
    for row in duck.execute(
        "SELECT id, position, date_creat, date_disso, objet FROM waldec WHERE titre IS NULL LIMIT 10"
    ).fetchall():
        print(f"  {row}")

    # titre length distribution
    print("\n=== titre LENGTH DISTRIBUTION ===")
    for row in duck.execute("""
        SELECT
            CASE
                WHEN titre IS NULL         THEN 'NULL'
                WHEN length(titre) = 0     THEN 'empty'
                WHEN length(titre) < 5     THEN '1-4 chars'
                WHEN length(titre) < 20    THEN '5-19 chars'
                ELSE '20+ chars'
            END AS bucket,
            count(*) AS n
        FROM waldec
        GROUP BY bucket ORDER BY n DESC
    """).fetchall():
        print(f"  {row[0]:15s}  {row[1]:>10,}")

    # Date anomalies
    print("\n=== DATE ANOMALIES (date_creat outside 1800–2030) ===")
    n = duck.execute(
        "SELECT count(*) FROM waldec WHERE date_creat < '1800-01-01' OR date_creat > '2030-01-01'"
    ).fetchone()[0]
    print(f"  {n:,} rows")

    duck.close()


def main() -> None:
    with tempfile.NamedTemporaryFile(suffix=".parquet", delete=False) as pf:
        path = pf.name

    try:
        download(path)
        analyse(path)
    finally:
        try:
            os.unlink(path)
        except OSError:
            pass


if __name__ == "__main__":
    main()
