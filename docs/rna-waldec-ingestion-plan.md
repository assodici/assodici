# RNA Waldec Ingestion Plan

## Status

**Blocked** — requires Supabase Pro upgrade ($25/mo, 8GB storage).
Free tier limit: 500MB. Estimated data size: ~1.5-2GB in Postgres.

## Data Source

| Field | Value |
|---|---|
| Dataset metadata URL | `https://www.data.gouv.fr/api/1/datasets/rna-agrege-a-lechelle-nationale/` |
| Waldec resource ID | `cc7b8f0c-45ea-4444-8b55-55d30bc34ac5` |
| Waldec download URL | `https://www.data.gouv.fr/api/1/datasets/r/cc7b8f0c-45ea-4444-8b55-55d30bc34ac5` |
| Format | Parquet (~299MB compressed) |
| Update frequency | Monthly |
| Last known update | 2026-06-01 |
| Estimated rows | ~1.3M associations |

**Never hardcode** the physical object URL (`https://object.files.data.gouv.fr/...`) — use the `/api/1/datasets/r/{resource_id}` redirect URL so it always resolves to the latest version.

## Architecture

```
data.gouv.fr API → GitHub Actions (cron) → DuckDB → Supabase Postgres
                                                    ↓
                                           ingestion_runs audit table
```

- Weekly cron (Monday 4am UTC) + manual trigger
- DuckDB reads Parquet and writes to Postgres via direct connection (not pooler — needed for COPY)
- Idempotent: compares `last_modified` + `filesize` against last ingestion run; skips download if unchanged
- Atomic swap: staging table → TRUNCATE + INSERT in one transaction → production table

## Database Schema

### `associations` table
```sql
create table public.associations (
  id              text primary key,       -- RNA number
  titre           text not null,
  objet           text,
  siret           text,
  adresse_siege   text,
  code_postal     text,
  commune         text,
  departement     text,
  date_creation   date,
  date_dissolution date,
  statut          text,
  source          text default 'waldec',
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index associations_titre_fts on public.associations using gin(to_tsvector('french', titre));
```

### `ingestion_runs` table
```sql
create table public.ingestion_runs (
  id            bigint generated always as identity primary key,
  resource_id   text not null,
  last_modified timestamptz,
  filesize      bigint,
  row_count     bigint,
  status        text not null,  -- 'success' | 'skipped' | 'error'
  error_message text,
  imported_at   timestamptz default now()
);
```

## Files to Create

| File | Purpose |
|---|---|
| `supabase/migrations/XXXXXX_associations.sql` | Schema migration |
| `scripts/sync-rna-waldec.ts` | Bun + DuckDB ingestion script |
| `.github/workflows/sync-rna.yml` | Scheduled GitHub Actions workflow |
| `src/app/page.tsx` | Update home page to show last update date |

## Ingestion Script Logic (`scripts/sync-rna-waldec.ts`)

```
1. GET dataset metadata → find Waldec resource by ID
2. Extract: last_modified, filesize
3. Query ingestion_runs for last successful run
4. If last_modified + filesize unchanged → log "up to date", exit
5. Download Parquet via redirect URL
6. DuckDB: read Parquet, validate row count > 1_000_000
7. BEGIN TRANSACTION
   - TRUNCATE associations
   - INSERT INTO associations SELECT ... FROM parquet_scan(...)
   COMMIT
8. INSERT INTO ingestion_runs (status='success', row_count, ...)
9. On any error: INSERT INTO ingestion_runs (status='error', error_message)
```

## GitHub Actions Workflow

```yaml
on:
  schedule:
    - cron: '0 4 * * 1'  # Monday 4am UTC
  workflow_dispatch:       # manual trigger

env:
  SUPABASE_DB_URL: ${{ secrets.SUPABASE_DB_URL }}
  SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

## Secrets to Add to GitHub Actions

Go to: GitHub repo → Settings → Secrets and variables → Actions

| Secret | Where to find |
|---|---|
| `SUPABASE_DB_URL` | Supabase Dashboard → Project Settings → Database → Connection string → Direct (not pooler) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Project Settings → API → service_role key |

## Home Page Integration

Query `ingestion_runs` for last successful run, display date:
```
Données mises à jour le [date] · [N] associations
```

## Future: Adding Import Dataset

If "Import" (pre-2009 legacy associations) is added later:
- Add `source text` column with values `'waldec'` or `'import'`
- Keep separate ingestion runs per source
- Never mix the two without the `source` discriminator
