# ADR-011 — Show cached data and refresh it in the background

- **Status** — The daily color cache is available on `main`. Shared and account-scoped caching is proposed in [PR 19](https://github.com/TheNathP/katch/pull/19).
- **Date** — 2026-11-26

## Context and constraints

The home screen and camera use the same target color. A slow connection can delay display each time a player navigates. The score and wallet need to reflect the outcome of a photo, and account data needs to stay isolated on a shared device. The server remains the source of truth for the challenge date, scores, and balance.

## Decision and alternatives

The home screen stores the latest challenge response in AsyncStorage and reads it before requesting an update. It derives the challenge deadline from server timestamps. The animation PR shares the daily challenge cache between home and camera, with results and rewards cached per account. Concurrent readers share an in-flight request. After a photo, the home screen can use the confirmed result immediately while the wallet refreshes in the background.

Waiting for a fresh response before each display would simplify synchronization, with more frequent loading states. A local database and an offline write queue could support recording actions offline, at the cost of managing challenge rollover and conflicts between devices.

## Consequences and limitations

The last known state can remain visible during an update or a network outage. The interface identifies an expired color as belonging to an earlier challenge. Scoring, purchases, and coin credits still depend on a server response. Activity on another device may only appear on the next refresh.

Temporary camera captures and resized upload files are removed when their flow ends. The app keeps the latest result in memory while its screen is open. Photos selected from the library remain under the system picker’s control.

Related decisions cover [the UTC challenge day](005-daily-challenge-color.md) and [server-side rewards](010-server-side-rewards.md).
