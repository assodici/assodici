# TODO

Tasks still open after the redesign. Check items off as they land; add new ones at the bottom of their section.

## Before going live (owner)

- [ ] Fill in the publisher placeholders in `src/lib/legal.ts` (name/company, status, address, publication director, contact email). They show on `/legal` and `/about`.
- [ ] Review and rewrite the draft copy in `src/app/about/page.tsx`. Confirm or remove the commitments it makes ("nous retirerons" impostor claims) and the privacy statements on `/legal` ("ni vendues ni cédées").
- [ ] Supabase Auth: make sure the redirect URL allow-list accepts `/auth/confirm?next=…` (e.g. `https://<domain>/**`), otherwise login can't return users to the page they came from.
- [ ] Supabase Auth: configure a custom SMTP provider. The built-in sender is rate-limited (a few emails per hour) and not meant for production magic links.
- [ ] After merging `dev` into `main`: `gh workflow enable "Sync RNA Waldec"`. It is disabled on purpose: until the merge, the scheduled run would use main's old script and break search.
- [ ] Check the live site end to end once deployed: login by magic link, claim an association, edit it, see the stamp and the edit in search.

## Product decisions pending (owner)

- [ ] Claims are instant and unverified. Decide whether that stays, or add a lightweight check later (e.g. review queue).
- [ ] Who handles abuse reports (contact email, response time), and how to revoke a claim: today it's deleting the row in `association_profiles` from the Supabase dashboard.

## Engineering (Claude)

- [ ] Add a real test runner (`bun test`) and move `src/lib/helpers.check.ts` into it; cover the search params parsing and the profile schema.
- [ ] Relevance for very broad queries: `search_associations` ranks only the first 1000 matches. If users complain, evaluate a RUM index (ordered ranking from the index).
- [ ] Typo tolerance: multi-word queries with several typos miss (trigram threshold 0.6 can't be changed per function on Supabase). Consider a per-word trigram fallback if needed.
- [ ] Browse without a query (place/theme only) shows the first 1000 matches sorted by name; add a btree on `titre` if full alphabetical browsing matters.
- [ ] Storage: ~226 MB of `associations` columns are never read by the app (`adrg_*`, `observation`, `dir_civilite`, …). Drop them from the sync's `COLUMNS` and table if disk gets tight (DB is ~3.2 GB of the 8 GB included in Supabase Pro).
- [ ] Design drift noted by the documenter: small owner stamp text is 8px, pagination buttons don't use the pill style, teal/olive/violet theme dots are faint on the ultramarine chips.
- [ ] `globals.css` body `word-spacing: 0.05em` is a workaround for Schibsted's tight space at bold weights; revisit if the font changes.
- [ ] React Doctor warnings left: detail page complexity (`src/app/association/[id]/page.tsx`), client redirect in `app-toast.tsx`.

## Cost notes (Vercel Hobby + Supabase Pro)

- Auth is verified locally with `getClaims()` (asymmetric JWT keys): no Auth server call per page view.
- Search, association pages and theme lists are cached with `"use cache"` (days/weeks) and invalidated by owner edits through cache tags; the weekly sync does not invalidate them, so data can lag up to a day after a sync.
- The logo skips Vercel image optimization (`unoptimized`).
- Keep an eye on: Vercel function invocations (the proxy runs on every page request) and Supabase disk during the weekly sync (old + new table coexist briefly, ~5–6 GB peak).
