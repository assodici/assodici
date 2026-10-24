# TODO

Tasks still open after the redesign. Check items off as they land; add new ones at the bottom of their section.

## Before going live (owner)

- [ ] Fill in the publisher placeholders in `src/lib/legal.ts` (name/company, status, address, publication director, contact email). They show on `/legal` and `/about`.
- [ ] Review and rewrite the draft copy in `src/app/about/page.tsx`. Confirm or remove the commitments it makes ("nous retirerons" impostor claims) and the privacy statements on `/legal` ("ni vendues ni cédées").
- [ ] Supabase Auth: make sure the redirect URL allow-list accepts `/auth/confirm?next=…` (e.g. `https://<domain>/**`), otherwise login can't return users to the page they came from.
- [ ] Email sending with Resend (free: 3,000/month, 100/day). Sender: `Asso d'ici <noreply@assodici.fr>`.
  1. Create a Resend account, add the domain `assodici.fr`, and add the DNS records Resend shows (SPF, DKIM, optional DMARC) at the domain registrar. Wait for "Verified".
  2. Resend → Integrations → Supabase → connect the `assodici` project (fills Supabase's SMTP settings), or paste host `smtp.resend.com`, port `465`, user `resend`, password = a Resend API key in Supabase → Authentication → Emails → SMTP Settings.
  3. Sender email `noreply@assodici.fr`, sender name `Asso d'ici`.
  4. In Resend, keep click/open tracking off: tracking rewrites links and breaks login emails.
- [ ] Upload the 8 branded email templates (and turn on the "email changed" / "password changed" security notifications): create a personal access token at https://supabase.com/dashboard/account/tokens, then run `SUPABASE_ACCESS_TOKEN=<token> python3 scripts/email_templates.py --push`. Source of truth: `scripts/email_templates.py`; generated HTML in `supabase/email-templates/`.
- [ ] Supabase → Authentication → URL Configuration: Site URL `https://www.assodici.fr`, redirect URLs include `https://www.assodici.fr/**` (and the Vercel preview domain if you test there).
- [ ] Vercel → Settings → Environment Variables: `SITE_URL` must be `https://www.assodici.fr` (or unset) for Production. It feeds canonical URLs, `robots.txt`, the sitemap and magic-link redirects.
- [ ] Google Search Console: verify `www.assodici.fr` and submit `https://www.assodici.fr/sitemap.xml`.
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

## Email notes

- Links go to our own `/auth/confirm?token_hash=…&type=…` (Supabase's SSR pattern), so a login requested on a laptop works when opened on a phone.
- Known limit: some corporate mail scanners (e.g. Microsoft Safe Links) open links before the user does, which consumes the one-time token ("lien invalide ou expiré"). Fix if it happens: send the 6-digit `{{ .Token }}` code too and add a code field on `/login`.

## SEO notes

- Sitemap lists static pages only (home, search, about, legal), by choice: 2.3M association pages would invite crawling beyond the Vercel free tier. Association pages are still indexable when Google finds them through links.
- `robots.txt` blocks search-result URLs, login, auth and edit pages; result pages are also `noindex, follow`.
- Association pages carry a canonical URL, Open Graph tags and schema.org `NGO` JSON-LD. No social preview image yet (generating one per page costs function time).

## Cost notes (Vercel Hobby + Supabase Pro)

- Auth is verified locally with `getClaims()` (asymmetric JWT keys): no Auth server call per page view.
- Search, association pages and theme lists are cached with `"use cache"` (days/weeks) and invalidated by owner edits through cache tags; the weekly sync does not invalidate them, so data can lag up to a day after a sync.
- The logo skips Vercel image optimization (`unoptimized`).
- Keep an eye on: Vercel function invocations (the proxy runs on every page request) and Supabase disk during the weekly sync (old + new table coexist briefly, ~5–6 GB peak).
