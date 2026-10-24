---
name: Assodici
description: Every French association as a membership card, on an ultramarine wallet.
colors:
  ultramarine: "#1f3fbf"
  white: "#ffffff"
  shell-muted: "#d3dbff"
  shell-field: "#f7f8fc"
  cool-paper: "#eef1f7"
  cardstock: "#fbfcfe"
  ink: "#141821"
  pale-steel: "#e3e8f6"
  slate-ink: "#4a5163"
  hairline: "#d5dae5"
  field-stroke: "#c5ccdb"
  alarm-red: "#b42318"
  theme-sport: "#1a7f4b"
  theme-culture: "#d63c22"
  theme-solidarity: "#e2b007"
  theme-education: "#0f7f86"
  theme-health: "#c2386a"
  theme-environment: "#5f7f1f"
  theme-civic: "#6a4bc4"
  theme-leisure: "#e07a1f"
  theme-economy: "#5f6b7a"
typography:
  display:
    fontFamily: "Schibsted Grotesk, sans-serif"
    fontSize: "3.75rem"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Schibsted Grotesk, sans-serif"
    fontSize: "3rem"
    fontWeight: 800
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Schibsted Grotesk, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.33
    letterSpacing: "-0.025em"
  card-title:
    fontFamily: "Schibsted Grotesk, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.375
  lead:
    fontFamily: "Schibsted Grotesk, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "Schibsted Grotesk, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Schibsted Grotesk, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.33
  card-number:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.33
rounded:
  control: "0.75rem"
  card: "1.05rem"
  slab: "1.35rem"
  pill: "9999px"
spacing:
  card-inset: "16px"
  panel-inset: "20px"
  slab-inset: "32px"
  grid-gap: "12px"
  gutter: "24px"
  section: "64px"
components:
  button-primary:
    backgroundColor: "{colors.ultramarine}"
    textColor: "{colors.white}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 20px"
  button-outline:
    backgroundColor: "{colors.cool-paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 24px"
  search-bar:
    backgroundColor: "{colors.shell-field}"
    textColor: "{colors.ink}"
    rounded: "{rounded.slab}"
    height: "76px"
  search-submit:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.cool-paper}"
    padding: "0 40px"
  association-card:
    backgroundColor: "{colors.cardstock}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-inset}"
  association-card-dissolved:
    backgroundColor: "{colors.pale-steel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
  info-panel:
    backgroundColor: "{colors.cardstock}"
    rounded: "{rounded.card}"
    padding: "{spacing.panel-inset}"
  theme-chip:
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "6px 14px"
  owner-stamp:
    textColor: "{colors.ultramarine}"
    rounded: "{rounded.pill}"
    size: "96px"
  input:
    backgroundColor: "{colors.cool-paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "40px"
---

# Design System: Assodici

## Overview

**Creative North Star: "Carte d'adhérent"**

Every association is a membership card. The card is numbered by its RNA identifier, banded across the top by the colour of its theme family, and stamped in ultramarine ink when its owner vouches for the information. Cards live in an ultramarine wallet: the header, the home field, the search bar strip and the title band of reading pages are one continuous ultramarine shell, and the cards sit on it or just below it on cool paper.

The system is dense where people scan (a three-column card grid, small mono card numbers, one-line places) and generous where people decide (a 76px search bar, a 60px headline, a pill call to action). It is flat cardstock, not glossy UI: depth comes from the shell/paper contrast and one soft lift for objects lying on the ultramarine. There are no images; identity is carried by colour bands, the stamp and type alone. Light and dark share the same bands; dark swaps the shell to deep navy and the cards to graphite.

It refuses the white directory of blue links and grey rows. A result is never a table row; it is always a card.

**Key Characteristics:**
- Ultramarine shell carrying header, hero, search strip and page titles.
- Cool-white cardstock cards with a solid theme band on top.
- JetBrains Mono as the card-number voice, Schibsted Grotesk for everything else.
- Rubber-stamp ring for owner-verified information.
- Dissolved associations shown as struck, perforated cards, never hidden.
- Pill-shaped actions, generously rounded cards.

## Colors

One saturated blue owns the frame; nine mid-value theme colours appear only as bands; everything else is cool, slightly blue-tinted paper and near-black ink.

### Primary
- **Ultramarine** (`ultramarine`): the shell field behind header, home hero, search strip, association hero and prose titles; the primary pill CTA; links in prose and empty states; the focus ring; the owner stamp ink; text caret. Dark mode: shell becomes deep navy (#0d1a4d) and the interactive ultramarine lightens to periwinkle (#9aabff) for contrast on graphite.
- **Periwinkle Mist** (`shell-muted`): secondary text on the shell (subline under the H1, specimen legends, RNA number above the edit title).

### Theme families (band colours)
Nine families map the 31 official Waldec parent themes (map in `src/lib/themes.ts`): **Stadium Green** (`theme-sport`), **Vermilion** (`theme-culture`), **Sulfur** (`theme-solidarity`), **Lagoon Teal** (`theme-education`), **Rose Madder** (`theme-health`), **Olive** (`theme-environment`, also heritage), **Civic Violet** (`theme-civic`), **Marigold** (`theme-leisure`), **Slate** (`theme-economy`). Same values in light and dark. A theme with no family falls back to slate ink at 40% opacity.

### Neutral
- **Ink** (`ink`): all body and heading text; the search submit fill; the band of non-association cards (login).
- **Cardstock** (`cardstock`): card, panel and footer surfaces. Dark: graphite #171c28.
- **Cool Paper** (`cool-paper`): page background below the shell. Dark: #0f131c.
- **Search Field White** (`shell-field`): the search bar and theme select sitting on the shell. Dark: #171c28.
- **Pale Steel** (`pale-steel`): muted, secondary and accent surfaces; the fill of a dissolved card. Dark: #222838.
- **Slate Ink** (`slate-ink`): muted text (descriptions, metadata, card numbers, hints). Dark: #a7afc2.
- **Hairline** (`hairline`): card rings, dividers, footer rule. Dark: #2a3142.
- **Field Stroke** (`field-stroke`): input borders. Dark: #3a4256.
- **Alarm Red** (`alarm-red`): form errors only. Dark: #f97066.

### Named Rules
**The Ultramarine Wallet Rule.** The top of every page is ultramarine shell: header plus the page's opening block (hero, search strip, association card, prose title). Content below sits on cool paper. Controls on the shell use white ink, a translucent white hover (12%) and a white focus outline.

**The Band Is the Theme Rule.** Theme colour appears only as a solid band across the top of a card and as the small dot in a theme chip. Never as text, fill, border or button colour.

## Typography

**Display Font:** Schibsted Grotesk (with sans-serif)
**Body Font:** Schibsted Grotesk (with sans-serif)
**Label/Mono Font:** JetBrains Mono 500 (with monospace)

**Character:** One sturdy newspaper grotesk does all the talking, from extra-bold headlines to body; the mono is the card's printed number, small and grey. Body carries a 0.05em word-spacing because Schibsted's space collapses at bold weights; mono resets it to normal.

### Hierarchy
- **Display** (800, 3.75rem desktop / 2.25rem mobile, 1.05, -0.03em): home H1 on the shell only. Prose pages use the same weight and tracking at 3rem / 2.25rem.
- **Headline** (800, 3rem desktop / 1.875rem mobile, 1.25, -0.02em): association name on its hero card.
- **Title** (800, 1.5rem, tight tracking): section headings ("Vous gérez une association ?", prose H2). Panel headings drop to 700 at 1rem; form legends 800 at 1.125rem.
- **Card title** (700, 1.125rem, 1.375, balanced): association name on a card.
- **Lead** (400, 1.125rem): subline under shell headlines, in periwinkle mist, max ~42rem.
- **Body** (400, 1rem, 1.5): descriptions and prose, capped at 65ch (`max-w-prose`). Card descriptions 0.875rem clamped to two lines.
- **Label** (600, 0.75rem): the theme label at a card's foot, chips and nav (0.875rem semibold).
- **Card number** (JetBrains Mono 500, 0.75rem on cards / 0.875rem on hero): RNA number, SIRET, founding year on the card.

### Named Rules
**The Card Number Rule.** Mono is reserved for identifiers printed on the card: RNA number, SIRET, and the card's founding year. Places, postal codes and written dates ("24 octobre 2026") stay in Schibsted.

## Layout

A single centred container (72rem max, 16px gutters, 24px from `sm`). The shell block at the top is full-bleed; its content aligns to the same container. Home hero padding is 40/64px (mobile) and 64/96px (desktop); prose and association heroes 48–64px.

Results are a card grid: 1 column, 2 from `sm` (640px), 3 from `lg` (1024px), 12px gaps, each card stretched to row height so feet align. Home specimens use a 3-column grid at 24px gaps. The association page splits at `lg` into a fluid main column and a 22rem aside of stacked panels (24px gaps). The search bar is one row of three cells from `sm` (query, place 15–20rem, submit) and stacks into three 56px rows on mobile. Pagination sits under the grid as a three-part row.

## Elevation & Depth

Flat by default: depth is the contrast between ultramarine shell, cool paper and cardstock, plus 1px hairline rings. Shadows are soft, downward, negatively spread and used only for objects that lie on the ultramarine field, plus a hover lift on cards.

### Shadow Vocabulary
- **Slab lift** (`box-shadow: 0 18px 40px -20px rgb(0 0 0 / 0.6)`): the association hero card and the login card on the shell.
- **Search lift** (`box-shadow: 0 10px 30px -12px rgb(0 0 0 / 0.45)`): the search bar on the shell.
- **Card hover** (`box-shadow: 0 6px 18px -8px rgb(20 24 33 / 0.35)`): association card on hover, paired with an ultramarine ring at 60%.

### Named Rules
**The Lift on the Shell Rule.** Only objects resting on the ultramarine shell carry a shadow at rest. Cards on paper are flat with a hairline ring and lift only on hover.

## Shapes

Generously rounded rectangles, from a 0.75rem base radius: controls 0.75rem, cards and panels 1.05rem, slabs (search bar, association hero, login card) 1.35rem. Every action and chip is a full pill. Cards clip their band with `overflow: hidden`, so the band follows the top corners. Two non-rectangular marks: the owner stamp is a ring rotated -6°, and the dissolved state uses dashed strokes (a perforation line under the band and a dashed pill).

## Components

### Buttons
Tactile pills, confident weight.
- **Shape:** full pill (9999px), 44px tall, bold 1rem label.
- **Primary:** ultramarine fill, white label, 20–24px horizontal padding; hover drops to 80% opacity; focus shows a 3px ultramarine ring at 50%.
- **Outline:** cool paper fill, hairline border, ink label; hover fills pale steel.
- **On the shell:** transparent with a white 60% border (header "Connexion", 36px tall) or text-only nav items with a 12% white hover.
- **Search submit:** the exception: a square-cornered ink slab filling the bar's last cell (bold, 32–40px padding), hover to 85%; in dark it inverts to a pale fill with navy text.

### Chips
- **Style:** pill on the shell, translucent white (12%) fill, white semibold 0.875rem label, preceded by a 10px theme-colour dot. Hover to 22% white.
- **Use:** home theme shortcuts only.

### Cards / Containers
- **Association card:** cardstock, 1.05rem radius, hairline ring, 10px theme band on top, then a mono row (RNA number left, year right), bold name, place, two-line description, and a foot with the theme label and optional stamp. The whole card is one link (stretched from the name). Hover: soft lift and ultramarine ring; focus-within: 2px ring.
- **Hero card (association page):** same anatomy scaled up: 16px band, 24–32px inset, slab radius and slab lift, large stamp bottom-right.
- **Info panels:** cardstock, 1.05rem radius, hairline ring, 20px inset, 1rem bold heading. The claim panel stands alone in the aside; when the viewer owns the association its ring becomes 2px ultramarine.

### Inputs / Fields
- **Search bar:** a 76px (hero) or 56px (bar) slab in search-field white with icons in slate ink, cells divided by a hairline; focus-within adds a 4px translucent white ring.
- **Form inputs:** 40–44px tall, 0.75rem radius, field-stroke border, transparent fill; focus swaps the border to ultramarine with a 3px ring at 50%. Errors: alarm-red text below, red border and ring.
- **Theme select (on shell):** 36px, search-field white, 0.75rem radius, chevron inside, white focus ring.

### Navigation
Header is a 64px ultramarine bar: light logo left, semibold 0.875rem white nav right (hidden below `sm` except theme toggle and account pill). Footer is cardstock with a hairline top rule: semibold links left, data attribution and version in slate ink right.

### Owner Stamp (signature)
A rubber-stamp ring in ultramarine ink (periwinkle in dark): 2–3px border, rotated -6°, bold uppercase "Infos de l'asso". 96px with a 12px label on the hero card; 64px on result cards. It appears only when the association has claimed its page.

### Dissolved card (signature)
Pale-steel fill, a dashed perforation line under the band, the name struck through (2px, 3px on the hero), and a dashed "Dissoute" pill where the year would be. Dissolved associations stay visible and readable.

## Do's and Don'ts

### Do:
- **Do** open every page with the ultramarine shell (#1f3fbf, #0d1a4d in dark) and let content continue on cool paper.
- **Do** render every association as a card with its theme band on top; use the 9-family map in `src/lib/themes.ts` and the 40% slate fallback.
- **Do** set RNA numbers and SIRET in JetBrains Mono 500, small and in slate ink.
- **Do** make actions full pills, 44px tall, bold.
- **Do** show the owner stamp only for claimed associations, and keep owner-provided text visibly attributed.
- **Do** keep dissolved associations visible as struck, perforated cards.

### Don't:
- **Don't** use theme colours for text, buttons or large fills; they are bands and dots.
- **Don't** add photos or illustrations; the product supports no images.
- **Don't** put shadows on cards resting on paper; lift is for the shell and hover.
- **Don't** use mono for prose dates, places or postal codes.
- **Don't** use uppercase outside the owner stamp.
- **Don't** present results as table rows or bare blue-link lists.
