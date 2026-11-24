---
paths:
  - "apps/mobile/**"
---

# Mobile app architecture rules

Every new file in `apps/mobile/` must fit this structure. If something doesn't fit, ask before inventing a new top-level folder.

```
apps/mobile/src/
├── app/                          → Expo Router routes ONLY (thin files)
│   ├── _layout.tsx               → entry point: providers, theme, navigator
│   └── play.tsx                  → export { default } from '@/pages/PlayPage';
├── pages/
│   └── <Page>Page/               → e.g. PlayPage/, ResultPage/
│       ├── <Page>Page.tsx        → THE PAGE: owns state, orchestrates
│       ├── <Page>Page.styles.ts
│       ├── index.ts
│       └── _page/                → components PRIVATE to this page ("_" = private)
│           └── <Page>Page<Name>/ → e.g. PlayPageCamera/, ResultPageScore/
│               ├── <Page>Page<Name>.tsx
│               ├── <Page>Page<Name>.styles.ts
│               └── index.ts
├── components/
│   ├── ui/                       → generic, STYLED building blocks (Button, ColorSwatch…)
│   └── shared/                   → generic utility building blocks, no own styling
├── data/
│   ├── get-<page>-page.ts        → fetches a page's data (mock or Edge Function call)
│   ├── api.types.ts              → API request/response types, mirror of apps/backend/supabase/functions/_shared/types.ts
│   └── adapters/<x>.adapters.ts  → turns API responses into app view types
├── lib/                          → pure TypeScript client logic, no React (formatting, color display helpers)
└── styles/theme.ts               → design tokens: colors, fonts, spacing, light/dark
```

## Responsibilities

- **`src/app/` = routing only.** A route file re-exports a page (`export { default } from '@/pages/PlayPage'`); layouts configure navigation. No UI, state or logic here — Expo Router treats every file in `src/app/` as a route.
- **The page owns the state.** `<Page>Page.tsx` holds `useState`/effects, calls `data/get-<page>-page.ts`, and passes data + callbacks down. `_page/` components are presentational: props in, callbacks out, no data fetching.
- **`_page/` components are private**: never import a `_page/` component from another page. If a second page needs it, promote it to `components/ui/` (styled) or `components/shared/` (unstyled) and drop the page prefix.
- **`components/ui` vs `components/shared`**: `ui` components have their own `.styles.ts` and use theme tokens; `shared` components carry no visual opinion (wrappers, layout helpers, `Image`…). Neither knows about a specific page or fetches data.
- **`data/`** is the only place that talks to the backend or mocks. It calls **Edge Functions only** — never `supabase.from(...)` / direct table access (the Supabase client is used for auth only). Raw shapes never leave `data/`: always go through an adapter, so pages and components only see app types.
- **No game outcome is decided in the app**: it uploads the photo and displays the score returned by the server. Never compute or send a score or an extracted color (see `.claude/rules/backend.md`).
- **`lib/`** is pure TS: no React, no React Native, no Supabase imports. Must be unit-testable in isolation.

## Styling

- No SCSS / CSS modules / CSS variables — they don't work on native. Each component has a sibling `<Name>.styles.ts` using `StyleSheet.create`.
- Colors, fonts and spacing come from `styles/theme.ts` (light + dark). No hard-coded hex values in components, except the dynamic game colors (target color, photo color).
- Read the current theme with the `useTheme()` hook.

## Naming & files

- Page and component folders and files: **PascalCase**, page-prefixed inside `_page/` (`PlayPageCamera`). Each folder has an `index.ts` that re-exports its default: import the folder (`@/components/ui/Button`), not the inner file.
- `data/`, `lib/` and `styles/` files: **kebab-case** (`get-play-page.ts`, `color-distance.ts`, `game.adapters.ts`).
- Imports use the `@/` alias (`@/*` → `src/*`), never long relative paths outside a component's own folder.
