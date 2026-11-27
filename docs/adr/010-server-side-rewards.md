# ADR-010 — Manage rewards and balances in Supabase

- **Status** — Proposed in [PR 17](https://github.com/TheNathP/katch/pull/17).
- **Date** — 2026-11-26

## Context and constraints

Progress, badges, and coin balances need to follow a player across devices. Retaking a photo, tapping a badge twice, or purchasing two items concurrently can lead to incorrect balances if each screen calculates credits independently.

## Decision and alternatives

Supabase calculates progression from days with a best integer score of at least 70. For photo rewards, a best score from 86 to 99 earns five coins. A score of 100 earns ten coins in total. An improved score credits only the difference from the coins already earned for that day. Players explicitly claim eligible badges, and the server records each claim once. Purchases and changes to equipped items also go through the server. The database serializes concurrent reward writes for the same player.

A wallet stored on the phone would simplify the prototype but would make cross-device consistency harder. Crediting every upload would give players an incentive to farm coins through retakes. Using the best score lets players retry while keeping a per-challenge limit.

## Consequences and limitations

The wallet and owned customizations follow the account. A lower-scoring attempt can replace the displayed result while previously earned coins remain in the wallet. Purchases and badge claims require a connection. The coin animation reflects the credit confirmed by the server.
