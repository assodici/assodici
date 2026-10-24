# Assodici

Mise en relation d'associations et particuliers. Search and browse French associations from the national RNA (Waldec) register.

## Stack

- Next.js 16 (App Router, Cache Components), React 19, TypeScript
- Bun as package manager and script runner
- Tailwind CSS v4, shadcn/ui (`base-nova`, Base UI primitives), lucide-react icons
- Supabase (Postgres full-text search, Auth via magic link, RLS), Zod for validation
- Python ingestion script synced weekly by GitHub Actions
- Deployed on Vercel (Analytics + Speed Insights)

## Getting started

```bash
bun install
cp .env.example .env.local   # fill in the values below
bun dev                      # http://localhost:3000
```

| Variable | Purpose |
|---|---|
| `SITE_URL` | Public site URL, used for auth redirects |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key |

Without the Supabase variables the app still renders, with a service status banner instead of data.

## Scripts

```bash
bun dev          # dev server
bun run build    # production build
bun start        # serve production build
bun lint         # ESLint
bun run doctor   # React Doctor scan
bun run check    # helper self-checks
bun run db:types # regenerate Supabase types from the live database
```

## Data ingestion

`scripts/sync-rna-waldec.py` downloads the RNA Waldec Parquet from data.gouv.fr, bulk-loads it into Postgres with a generated full-text search column and its indexes, and swaps the new table into place atomically. Search runs in Postgres (`search_associations`), with no separate index to maintain. It runs every Monday at 04:00 UTC via `.github/workflows/sync-rna.yml` (secret: `SUPABASE_DB_URL`) and can be triggered manually.

```bash
pip install -r scripts/requirements.txt
SUPABASE_DB_URL=postgres://... python scripts/sync-rna-waldec.py
```

`scripts/analyse-waldec.py` checks the Parquet for data quality issues against the spec in `docs/`.

## Project layout

```
src/app/            routes (home, search, association/[id] + edit, about, legal, login, auth/confirm)
src/components/     app components; ui/ holds shadcn primitives
src/lib/supabase/   server clients and generated database types
src/lib/            data access (associations.ts), formatting, schemas, themes
src/proxy.ts        refreshes the Supabase session on each request
scripts/            Python ingestion and analysis
supabase/           Auth email templates
docs/               RNA spec and ingestion notes
```
