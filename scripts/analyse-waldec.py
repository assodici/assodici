#!/usr/bin/env python3
"""Download and analyse the RNA Waldec Parquet for data quality issues."""

import os
import tempfile
import requests
import duckdb

WALDEC_RESOURCE_ID = "cc7b8f0c-45ea-4444-8b55-55d30bc34ac5"
DATA_GOUV_REDIRECT = f"https://www.data.gouv.fr/api/1/datasets/r/{WALDEC_RESOURCE_ID}"

# Schema-defined max lengths from PDF spec — used to detect violations
VARCHAR_LIMITS: dict[str, int] = {
    "id": 10, "id_ex": 10, "siret": 14, "rup_mi": 11, "gestion": 4,
    "nature": 1, "groupement": 1, "position": 1, "objet_social1": 6, "objet_social2": 6,
    "titre": 250, "titre_court": 38,
    "adrs_complement": 76, "adrs_numvoie": 10, "adrs_repetition": 1,
    "adrs_typevoie": 5, "adrs_libvoie": 42, "adrs_distrib": 38,
    "adrs_codeinsee": 5, "adrs_codepostal": 5, "adrs_libcommune": 45,
    "adrg_declarant": 38, "adrg_complemid": 38, "adrg_complemgeo": 38,
    "adrg_libvoie": 38, "adrg_distrib": 38, "adrg_codepostal": 5,
    "adrg_achemine": 32, "adrg_pays": 38,
    "dir_civilite": 2, "siteweb": 64, "publiweb": 1, "observation": 255,
}


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

    total = duck.execute("SELECT count(*) FROM waldec").fetchone()[0]
    parquet_cols = {r[0] for r in duck.execute("DESCRIBE waldec").fetchall()}

    print(f"\n=== SCHEMA ({len(parquet_cols)} columns, {total:,} rows) ===")
    for row in duck.execute("DESCRIBE waldec").fetchall():
        print(f"  {row[0]:30s} {row[1]}")

    print("\n=== POSITION DISTRIBUTION ===")
    for row in duck.execute(
        "SELECT position, count(*) FROM waldec GROUP BY position ORDER BY 2 DESC"
    ).fetchall():
        print(f"  {row[0]!r:5s}  {row[1]:>10,}")

    print("\n=== NULL RATES (columns with any nulls) ===")
    for col in parquet_cols:
        n = duck.execute(f"SELECT count(*) FROM waldec WHERE {col} IS NULL").fetchone()[0]
        if n:
            print(f"  {col:30s}  {n:>10,}  ({n / total * 100:.1f}%)")

    print("\n=== VARCHAR SPEC VIOLATIONS (actual max > PDF spec) ===")
    any_violation = False
    for col, limit in VARCHAR_LIMITS.items():
        if col not in parquet_cols:
            continue
        actual_max = duck.execute(
            f"SELECT max(length({col})) FROM waldec"
        ).fetchone()[0] or 0
        if actual_max > limit:
            count = duck.execute(
                f"SELECT count(*) FROM waldec WHERE length({col}) > {limit}"
            ).fetchone()[0]
            print(f"  {col:30s}  spec={limit:>4}  actual_max={actual_max:>5}  violating_rows={count:,}")
            any_violation = True
    if not any_violation:
        print("  none — all columns within spec")

    print("\n=== COLUMNS MISSING FROM PARQUET ===")
    expected = set(VARCHAR_LIMITS) | {"date_creat", "date_decla", "date_publi", "date_disso", "maj_time", "telephone", "email"}
    missing = expected - parquet_cols
    print(f"  {sorted(missing) or 'none'}")

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
