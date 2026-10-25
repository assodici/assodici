# TODO

Tasks still open after the redesign. Check items off as they land; add new ones at the bottom of their section.

## Before going live (owner)

- [ ] Fill in the publisher placeholders in `src/lib/legal.ts` (name/company, status, address, publication director, contact email). They show on `/legal` and `/about`.
- [ ] Review and rewrite the draft copy in `src/app/about/page.tsx`. Confirm or remove the commitments it makes ("nous retirerons" impostor claims) and the privacy statements on `/legal` ("ni vendues ni cédées").
- [ ] Supabase Auth: make sure the redirect URL allow-list accepts `/auth/confirm?next=…` (e.g. `https://<domain>/**`), otherwise login can't return users to the page they came from.
- [ ] Upload the 8 branded email templates (and turn on the "email changed" / "password changed" security notifications): create a personal access token at https://supabase.com/dashboard/account/tokens, then run `SUPABASE_ACCESS_TOKEN=<token> python3 scripts/email_templates.py --push`. Source of truth: `scripts/email_templates.py`; generated HTML in `supabase/email-templates/`.
- [ ] Supabase → Authentication → URL Configuration: Site URL `https://www.assodici.fr`, redirect URLs include `https://www.assodici.fr/**` (and the Vercel preview domain if you test there).
- [ ] Vercel → Settings → Environment Variables: `SITE_URL` must be `https://www.assodici.fr` (or unset) for Production. It feeds canonical URLs, `robots.txt`, the sitemap and magic-link redirects.
- [ ] Google Search Console: verify `www.assodici.fr` and submit `https://www.assodici.fr/sitemap.xml`.
- [ ] Check the live site end to end once deployed: login by magic link, claim an association, edit it, see the stamp and the edit in search.

- [ ] Supabase → Authentication → Rate Limits: check the email-sent limit. Resend's free tier caps at 100 emails a day, so a script hammering the login form could exhaust it and block real logins.

## Product decisions pending (owner)

- [ ] Captcha on the login form (Cloudflare Turnstile is free and supported natively by Supabase Auth) against login-email flooding and quota exhaustion.

- [ ] Claims are instant and unverified. Decide whether that stays, or add a lightweight check later (e.g. review queue).
- [ ] Who handles abuse reports (contact email, response time), and how to revoke someone else's claim: owners can release their own, but removing an impostor is still deleting the row in `association_profiles` from the Supabase dashboard.

## Engineering (Claude)

- [ ] Add a real test runner (`bun test`) and move `src/lib/helpers.check.ts` into it; cover the search params parsing and the profile schema.
- [ ] Relevance for very broad queries: `search_associations` ranks only the first 1000 matches. If users complain, evaluate a RUM index (ordered ranking from the index).
- [ ] Typo tolerance: multi-word queries with several typos miss (trigram threshold 0.6 can't be changed per function on Supabase). Consider a per-word trigram fallback if needed.
- [ ] Browse without a query (place/theme only) shows the first 1000 matches sorted by name; add a btree on `titre` if full alphabetical browsing matters.
- [ ] Storage: ~226 MB of `associations` columns are never read by the app (`adrg_*`, `observation`, `dir_civilite`, …). Drop them from the sync's `COLUMNS` and table if disk gets tight (DB is ~3.2 GB of the 8 GB included in Supabase Pro).
- [ ] Design drift noted by the documenter: small owner stamp text is 8px, pagination buttons don't use the pill style, teal/olive/violet theme dots are faint on the ultramarine chips.
- [ ] `globals.css` body `word-spacing: 0.05em` is a workaround for Schibsted's tight space at bold weights; revisit if the font changes.
- [ ] `bun audit`: postcss (build-time only, via next/tailwind/shadcn) still flagged for source-map path traversal; clears when next bumps its pinned postcss. Re-run `bun audit` after each Next upgrade.
- [ ] A full Content-Security-Policy (script-src with nonces) was skipped: nonces force dynamic rendering and break the cached/partially prerendered pages. Only `frame-ancestors` is set in `next.config.ts`.
- [ ] React Doctor warnings left: detail page complexity (`src/app/association/[id]/page.tsx`), client redirect in `app-toast.tsx`.
