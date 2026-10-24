---
version: 1
slug: "src-app-page-tsx"
primary_target: "src/app/page.tsx"
related_targets: ["src/app/search/page.tsx","src/app/association/[id]/page.tsx","src/app/about/page.tsx","src/app/legal/page.tsx"]
---

# Site surfaces: home, search, association, about, legal

Scope: the whole public site. Mode: Operate (home, search, association, edit), Read (about, legal). Code-led.
Audience: residents searching near them; association managers claiming and editing (equal weight).
Job: find the right association in one search; scan results at a glance; claim and correct a page.
Constraints: no images, French "vous", no invented claims, AA contrast, light + dark.

## Direction contract

THESIS: Every association is a membership card: numbered by its RNA, banded by its theme, stamped when its owner vouches for it. Refuses the white directory of blue links and grey rows.

OWN-WORLD: Ultramarine shell and home field; cards are cool white cardstock with a solid theme band on top (9 theme families: sport green, culture vermilion, solidarity sulfur, education teal, health rose, environment/heritage olive, civic violet, leisure orange, economy slate). Ink near-black. Rubber-stamp ring in ultramarine ink for owner-verified info. Schibsted Grotesk for everything, JetBrains Mono for RNA numbers and dates. Dark: deep navy shell, graphite cards, same bands.

STORY: A resident reads the promise, types what and where, and scans cards (name, place, theme, status, year). A manager sees "C'est votre association ?" on the card page, claims it, edits, and the stamp appears.

FIRST VIEWPORT: Home: full-width ultramarine field. Header row (logo, Rechercher, À propos, Se connecter). H1 at ~64px, subline with the live count and update date. Search bar ~76px tall, three cells (quoi | où | Rechercher), autofocused. Real theme chips below. Three how-it-works cards in the card language at the bottom of the field. Search page: compact ultramarine bar with the search, filters row, then a dense 3-column card grid.

FORM: Carte d'adhérent, candidate 4 of 7 on the ordered list. seed:1d7021795082711f. Signature move: the card itself (theme band, mono RNA number as card number, ownership stamp, dissolved card perforated and struck); claim action isolated on its own card.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
