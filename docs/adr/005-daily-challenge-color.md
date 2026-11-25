# ADR-005 — Use a shared UTC day for daily challenges

- **Status** — Accepted
- **Date** — 2026-11-25

## Decision

Store one daily challenge per UTC date. The first authenticated request for the day draws a target from a palette of recognizable colors and stores the result. Subsequent players receive that same color. A transaction lock serializes creation, and the draw excludes the most recent target. The database determines the current day and the next midnight in UTC.

`GET /functions/v1/get-daily-color` returns `date`, `colorHex`, `endsAt`, and `serverTime`. The app uses server times to schedule a reload and requests the current challenge again on focus or when it returns to the foreground. The database and its functions are accessible to the service role.

## Consequences

Every player gets the same 24-hour window, even across daylight saving changes. The home screen counts down to the reset using the remaining time reported by the server. Only days with traffic acquire a stored challenge. A scheduled creation job can be added when there is a daily notification to send.

The app masks the target until the player reveals it. It stores the UTC challenge date on the device before starting the reveal animation, so reopening the app on the same day restores the visible target.

## Local verification

Run `pnpm --filter @katch/backend test:daily-color` from the repository root to check the migration and endpoint with in-memory PostgreSQL and simulated Supabase HTTP responses.

For a device test, start local Supabase with `pnpm db:start`. From `apps/backend` run `pnpm status` to find the local API URL and publishable key, or the local anon key if the CLI shows legacy keys. Put those values in `apps/mobile/.env.local`:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<local-publishable-key>
EXPO_PUBLIC_DAILY_COLOR_LOCAL_GUEST=1
```

For a physical phone, use the development Mac's LAN address in the URL and connect both devices to the same network. Serve the Edge Functions with `pnpm functions:serve`, then open the app with `pnpm mobile`. Two devices connected to the same stack should show the same target.

The local guest flag opens the home screen directly in development and uses an in-memory guest session to obtain a real user JWT from local Supabase. The production app will use the signed-in player's session once account sign-in is implemented.
