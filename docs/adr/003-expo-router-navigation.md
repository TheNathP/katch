# ADR-003 — Organizing mobile navigation with Expo Router

- **Status** — Accepted
- **Date** — 2026-11-24

## Decision

Use Expo Router for file-based navigation in the [mobile workspace](../../apps/mobile). Routes under `src/app/` re-export pages from `src/pages/`. Layouts configure the root stack and the primary tabs. Reusable navigation UI lives in `src/components/ui/`.

## Background

Katch needs stable entry points for the daily challenge, friends, rankings, and the player profile. Individual screens will gain behavior as those areas develop.

## Considerations

Expo Router is part of the [mobile stack](001-react-native-expo.md). File-based routing exposes the navigation structure in the directory tree. Thin route files keep each page's interface and state together, following the [mobile architecture rules](../../.claude/rules/architecture.md).

## Consequences

- The [root stack](../../apps/mobile/src/app/_layout.tsx) defines secondary routes. The [tab layout](../../apps/mobile/src/app/%28tabs%29/_layout.tsx) defines the primary destinations.
- Renaming or moving a route can change its URL. Check links that reference the route when making this change.
- The app uses a common navigation structure on iOS and Android. Verify the interaction and rendering on both platforms.

## Ownership

The Katch team maintains the route structure and mobile navigation.

## Review

Revisit this decision if a required flow cannot be expressed clearly with the existing stack and tabs.
