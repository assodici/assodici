# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Two audiences, equally important:
- **Residents** looking for an association near them: to join, volunteer, practise an activity or get help. They arrive with a name, a place or an interest and want an answer fast, often on a phone.
- **Association managers** who want their association's page to be accurate. They log in (magic link), claim their association and correct or complete the public data.

## Product Purpose
Assodici ("Asso d'ici") is a free directory of every French association registered in the national RNA register (~2.3M, Waldec dataset, refreshed weekly from data.gouv.fr). It makes that register searchable and readable, and lets associations fix what the government data gets wrong or leaves out. Success: a visitor finds the right association in one search, and claimed pages carry better information than the register.

## Positioning
- Readable, relevant search over the complete register, not a raw government listing.
- Owner-updated information layered on top of official data (owner edits override the register; the register remains the fallback).
- Local discovery: what exists near you ("d'ici").
- Free, no ads, independent project.

## Operating Context
- Search by name, place (city, postal code, département) or interest; filters: place, theme (official Waldec "objet social" nomenclature), include dissolved associations.
- Association page: official data (RNA number, SIRET, dates, address, purpose) merged with owner-provided data.
- Claim is instant for any logged-in user (one owner per association, max 5 per user). Owners edit name, description, address, contact email, phone, website. No images.
- Pages: home, search results, association detail (+ owner edit), about, legal.

## Capabilities and Constraints
- Government data quality is poor: no emails or phones, ~3% websites, purposes often terse, dissolved associations included (marked by position code).
- No images anywhere (not supported for now).
- No new pages or features without the user's validation.
- French only. Light and dark themes.
- Next.js 16, Tailwind v4, shadcn base-nova, Supabase.

## Brand Commitments
- Name: Assodici / "Asso d'ici". Logo kept: `public/brand/logo-on-dark.png` (light logo for dark backgrounds).
- Voice: French, "vous", clear and warm, public-service trustworthy without bureaucratic tone.
- The previous visual identity (red/yellow/blue/orange palette, Bungee headlines) is retired; the user asked for a new visual identity.

## Evidence on Hand
- Real data: 2.3M association records; official theme nomenclature (31 parent themes).
- No testimonials, user counts, partners or press exist. Do not fabricate any.
- Publisher identity and about-page story are not yet provided (placeholders, to be filled by the user).

## Product Principles
1. The search box is the product: reachable immediately, forgiving, fast.
2. Show what is known, say clearly what is not; never dress up missing data.
3. Official data and owner data are visibly distinct.
4. One glance per result: name, place, theme, status.

## Accessibility & Inclusion
Public audience of all ages, many on mobile: WCAG 2.2 AA contrast, full keyboard use, readable sizes.
