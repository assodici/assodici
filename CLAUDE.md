# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Next.js version warning

This is Next.js 16 — APIs, conventions, and file structure may differ from training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices (e.g. `middleware.ts` is now `proxy.ts`).

## Commands

```bash
bun dev          # start dev server
bun run build    # production build (plain `bun build` runs Bun's bundler, not this script)
bun start        # run production build
bun lint         # ESLint
bun run doctor   # React Doctor scan (also runs in CI on PRs and pushes to main)
```

No test runner configured yet — add one before writing tests.

Add shadcn components:
```bash
bunx shadcn@latest add <component>
```

## Architecture

**Runtime:** Next.js 16 (App Router, `cacheComponents: true` in `next.config.ts`), React 19, Bun, TypeScript strict mode.

**Styling:** Tailwind CSS v4 — no `tailwind.config.ts`. Config lives entirely in `src/app/globals.css` via `@theme inline` (it also imports `shadcn/tailwind.css`, so `shadcn` stays installed as a dev dependency). Animations via `tw-animate-css`. Dark mode via `.dark` class (`@custom-variant dark (&:is(.dark *))`), toggled with `next-themes`.

**Components:** shadcn `base-nova` style (Base UI primitives, not Radix), neutral base color, CSS variables for theming. All shadcn primitives land in `src/components/ui/`. Utility `cn()` in `src/lib/utils.ts` (clsx + tailwind-merge).

**Path aliases:** `@/` → `src/`, `@root/` → repo root.

**Alias targets** (from `components.json`):
- `@/components` — shared components
- `@/components/ui` — shadcn primitives (do not edit directly)
- `@/lib` — utilities
- `@/hooks` — custom hooks

**RSC by default:** all components are Server Components unless marked `"use client"`. shadcn components requiring interactivity already include this directive.

**Icons:** lucide-react only. It has no brand icons; inline an SVG for those.

**Toasts:** sonner.

## Supabase

- Clients in `src/lib/supabase/`: `createBrowserClient()` (client.ts), `createServerClient()`, `createPublicClient()`, cached `getUser()` and `isSupabaseConfigured()` (server.ts).
- Guard every Supabase call with `isSupabaseConfigured()` — missing env vars must degrade gracefully (see `ServiceStatusBanner`), never crash the request or build.
- `src/proxy.ts` refreshes the auth session on each request. Do not add logic between `createServerClient` and `getUser` there.
- Auth is magic link: `src/app/actions/auth.ts`, `src/app/auth/confirm/route.ts`, template in `supabase/email-templates/`.
- The live database is the schema source of truth; there are no migration files in the repo. Inspect it via the Supabase MCP server (`.mcp.json`) before schema work, and regenerate `src/lib/supabase/types.ts` after changes.
- Env vars: `SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (see `.env.example`).

## Data ingestion

`scripts/sync-rna-waldec.py` (Python 3.12, DuckDB + psycopg2) loads the RNA Waldec Parquet from data.gouv.fr into `associations` and the search table via build-then-RENAME swap, and logs to `ingestion_runs`. Runs weekly via `.github/workflows/sync-rna.yml` with secret `SUPABASE_DB_URL`. Spec: `docs/RNA_Liste_donnees_diffusees-V2.pdf`.
