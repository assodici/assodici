# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Next.js version warning

This is Next.js 16 — APIs, conventions, and file structure may differ from training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Commands

```bash
bun dev          # start dev server
bun build        # production build
bun start        # run production build
bun lint         # ESLint
```

No test runner configured yet — add one before writing tests.

Add shadcn components:
```bash
bunx shadcn@latest add <component>
```

## Architecture

**Runtime:** Next.js 16 (App Router), React 19, Bun, TypeScript strict mode.

**Styling:** Tailwind CSS v4 — no `tailwind.config.ts`. Config lives entirely in `src/app/globals.css` via `@theme inline`. Animations via `tw-animate-css`. Dark mode via `.dark` class (`@custom-variant dark (&:is(.dark *))`).

**Components:** shadcn `base-nova` style, neutral base color, CSS variables for theming. All shadcn primitives land in `src/components/ui/`. Utility `cn()` in `src/lib/utils.ts` (clsx + tailwind-merge).

**Path alias:** `@/` → `src/`.

**Alias targets** (from `components.json`):
- `@/components` — shared components
- `@/components/ui` — shadcn primitives (do not edit directly)
- `@/lib` — utilities
- `@/hooks` — custom hooks

**RSC by default:** all components are Server Components unless marked `"use client"`. shadcn components requiring interactivity already include this directive.

**Icons:** lucide-react.
