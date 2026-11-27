# ADR-012 — Apply separate visibility rules to scores and photos

- **Status** — Implemented on `main`.
- **Date** — 2026-11-26

## Context and constraints

Katch lets players compare daily scores globally and with friends. Seeing someone else's photo before playing can reveal a clue for the challenge, and photos can contain personal details. A pending friend request should leave friends-only results private.

## Decision and alternatives

The server authenticates the viewer before responding. The global leaderboard returns the top 50 places and the viewer's own rank when available. The friends leaderboard includes the viewer and accepted friends. Recent results on a player's profile are visible to that player and their accepted friends.

Challenge photos are stored in a private bucket. From the leaderboard, a player can view their own photo. To view another player's photo for the day, they must first submit their own attempt that day. After checking access, the server issues a signed URL that expires after two minutes.

Showing all leaderboard photos immediately would make it easier to discover submissions, but it could reveal clues before the first attempt. Restricting photo access to accepted friends would reduce exposure and limit interaction on the global leaderboard.

## Consequences and limitations

Players can compare scores before submitting a photo. The server enforces access to photos before issuing a signed URL. Anyone with that URL can use it until it expires. A player can view a photo through the leaderboard after their own attempt even when the two players are not friends.

See [history and collection](009-history-and-collection.md) for access to personal challenge photos.
