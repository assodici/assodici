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
src/components/     app components by domain (layout, association, search, auth); ui/ holds shadcn primitives
src/lib/supabase/   server clients and generated database types
src/lib/            data access (associations.ts), formatting, schemas, themes
src/proxy.ts        refreshes the Supabase session on each request
scripts/            Python ingestion and analysis
supabase/           Auth email templates
docs/               RNA spec and ingestion notes
```

## Operations notes

### Email

- Sent by Resend over Supabase SMTP as `Asso d'ici <noreply@mail.assodici.fr>` (free: 3,000/month, 100/day). Keep Resend click/open tracking off: it rewrites links and breaks login emails.
- Links go to our own `/auth/confirm?token_hash=…&type=…` (Supabase's SSR pattern), so a login requested on a laptop works when opened on a phone.
- Known limit: some corporate mail scanners (e.g. Microsoft Safe Links) open links before the user does, which consumes the one-time token ("lien invalide ou expiré"). Fix if it happens: send the 6-digit `{{ .Token }}` code too and add a code field on `/login`.

### SEO

- Sitemap lists static pages only (home, search, about, legal), by choice: 2.3M association pages would invite crawling beyond the Vercel free tier. Association pages are still indexable when Google finds them through links.
- `robots.txt` blocks search-result URLs, login, auth and edit pages; result pages are also `noindex, follow`.
- Association pages carry a canonical URL, Open Graph tags and schema.org `NGO` JSON-LD. No social preview image yet (generating one per page costs function time).

### Cost (Vercel Hobby + Supabase Pro)

- Auth is verified locally with `getClaims()` (asymmetric JWT keys): no Auth server call per page view.
- Search, association pages and theme lists are cached with `"use cache"` (days/weeks) and invalidated by owner edits through cache tags; the weekly sync does not invalidate them, so data can lag up to a day after a sync.
- The logo skips Vercel image optimization (`unoptimized`).
- Keep an eye on: Vercel function invocations (the proxy runs on every page request) and Supabase disk during the weekly sync (old + new table coexist briefly, ~5–6 GB peak).
