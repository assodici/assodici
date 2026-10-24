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
bun run check    # assert-based self-check of pure helpers (src/lib/helpers.check.ts)
bun run db:types # regenerate src/lib/supabase/types.ts from the live DB (Supabase CLI)
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

**Design:** visual world "Carte d'adhérent" (see PRODUCT.md and `.impeccable/surfaces/`): ultramarine `shell` tokens, cards with a theme-colour band (`src/lib/themes.ts`), RNA number in mono, owner stamp (`src/components/card-marks.tsx`). Tokens live in `globals.css`; never hard-code colours.

**Toasts:** sonner.

## Supabase

- Clients in `src/lib/supabase/server.ts`: `createServerClient()` (cookies, for auth and owner writes), `createPublicClient()` (no cookies, usable inside `"use cache"`), cached `getUser()`, `isSupabaseConfigured()`. There is no browser client.
- Guard every Supabase call with `isSupabaseConfigured()`: missing env vars must degrade gracefully, never crash the request or build.
- Reads live in `src/lib/associations.ts` (`"use cache"` + `cacheTag`); they throw on error so failures are never cached. Writes are server actions in `src/app/actions/` that call `updateTag` on the association tag and `SEARCH_TAG`.
- The live database is the schema source of truth; there are no migration files. Apply changes with the Supabase MCP server (`.mcp.json`), then run `bun run db:types` (needs `bunx supabase login` once, or `SUPABASE_ACCESS_TOKEN`). Never hand-edit `types.ts`.
- Search: `search_associations(q, lieu, theme, include_dissolved, lim, off)`, SECURITY INVOKER plpgsql. French unaccented full-text on the generated `associations.search_vector` (built by the sync script) plus owner profiles, trigram fallback for typos, prefix filters on postal code/commune. No separate search table.
- Claims: a row in `association_profiles` = one owner per association (max 5 per user). RLS + column-level grants enforce ownership; `owner_id` defaults to `auth.uid()`. Never add a FK to `associations` and never reference `associations` directly from a policy: the weekly RENAME swap would break it (use `private.association_exists()`).
- `association_themes`: official Waldec nomenclature; parents have `code = parent_code`.
- `src/proxy.ts` refreshes the auth session on each request. Do not add logic between `createServerClient` and `getUser` there.
- Auth is magic link: `src/app/actions/auth.ts`, `src/app/auth/confirm/route.ts`, template in `supabase/email-templates/`. Redirect targets go through `safeNextPath()` (`src/lib/url.ts`).
- Env vars: `SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (see `.env.example`).

## Data ingestion

`scripts/sync-rna-waldec.py` (Python 3.12, DuckDB + psycopg2) loads the RNA Waldec Parquet from data.gouv.fr into `associations_new`, adds the generated `search_vector` and the indexes (the script is the source of truth for both), then swaps it live by RENAME, and logs to `ingestion_runs`. Runs weekly via `.github/workflows/sync-rna.yml` with secret `SUPABASE_DB_URL`; manual runs accept `force` to rebuild an unchanged dataset. GitHub disables scheduled workflows after 60 days without repo activity: re-enable with `gh workflow enable "Sync RNA Waldec"`. Spec: `docs/RNA_Liste_donnees_diffusees-V2.pdf`.
