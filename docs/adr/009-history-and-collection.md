# ADR-009 — Build history and collection from challenge results

- **Status** — Proposed in [PR 18](https://github.com/TheNathP/katch/pull/18).
- **Date** — 2026-11-26

## Context and constraints

Players need to revisit past challenges and photos from their profile. The collection tracks the colors offered since signup and those the player has collected. Personal history and gallery requests must use the signed-in player's account, and the amount of data grows with each challenge.

## Decision and alternatives

The Edge Function authenticates the player and joins their results with the daily challenge colors. The calendar loads results by month. The gallery and collection load entries in pages. A color enters the collection when the score reaches 90. The server grants photo access through signed URLs that expire after ten minutes.

A separate color inventory could simplify some reads, but it would need to stay in sync whenever a challenge result is replaced. Loading the whole gallery at once would simplify the initial implementation, with increasing transfer and loading costs over time.

## Consequences and limitations

History, gallery, and collection derive from the same results, which helps keep their counts consistent. Expired photo URLs need to be renewed. Replacing the day's result also replaces its gallery entry. The offered-color count uses the challenges created since the player's signup date in UTC.
