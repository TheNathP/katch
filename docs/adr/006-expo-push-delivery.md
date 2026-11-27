# ADR-006 — Enqueue push notifications on the backend

- **Status** — Accepted
- **Date** — 2026-11-24

## Decision

Use Expo Push Service for iOS and Android delivery. Supabase stores device registrations and queues one delivery per recipient device. Each future game event selects its recipients, creates a message, and calls `enqueuePushNotification`. A server-only Edge Function sends batches and checks receipts.

## Background

The daily challenge and friend requests share the same device registration, delivery, and error handling. Future notifications can reuse that infrastructure.

## Considerations

Expo provides one HTTP API for APNs and FCM. A database queue lets the game logic finish independently of push delivery, records a stable event key to deduplicate repeated enqueues, and preserves Expo's ticket IDs for receipt checks. The backend owns the notification text, recipients, and destination.

## Consequences

- `POST /functions/v1/push-registration` binds an Expo push token to the authenticated caller. `DELETE` removes that caller's binding. Both accept `{ "token": "ExpoPushToken[...]" }` and return `{ "registered": true|false }`.
- `POST /functions/v1/push-worker` requires the `x-push-worker-secret` header and processes up to 100 sends and 100 receipt checks per call. Calls with an unknown outcome are recorded so a second worker does not replay an in-flight batch. Explicit transient errors can be retried up to five send attempts, within the notification's expiry.
- The worker checks receipts starting 15 minutes after submission and removes invalid registrations. An accepted receipt means APNs or FCM accepted the message. The worker prunes completed records after 30 days.

## Daily challenge notification

Creating a [daily challenge](005-daily-challenge-color.md) for the current UTC day queues a notification for every registered device in the same transaction. Reading an existing challenge does not enqueue another message. The event expires at the next UTC midnight and opens the home screen, where the player can reveal the target.

Apply the daily challenge migration before the notification trigger migration. The first authenticated request that generates the day's color also queues its notification.

## Friend request notification

A new pending friendship queues a push for the recipient's registered devices. An ID assigned to each request keeps retries from creating duplicate deliveries and lets a fresh request after removal get its own notification. Accepting, declining, or withdrawing the request stops deliveries that are still waiting to be sent.

The push expires after 24 hours and opens `/amis`, where the app refreshes the received requests. Its text can appear on a lock screen and omits the sender's identity.

## Adding a notification

A backend function can enqueue a new event with a stable key and user IDs obtained from server-side game data. Use `expiresAt` when a notification becomes irrelevant at a specific time.

```ts
import { enqueuePushNotification } from '../_shared/push/delivery.ts';

await enqueuePushNotification({
  eventKey: 'streak-reminder:2026-11-24',
  userIds: eligiblePlayerIds,
  notification: {
    title: 'Ta série Katch',
    body: 'Joue aujourd’hui pour continuer ta série.',
    destination: '/progression/serie',
  },
});
```

## Local verification

Run the notification tests from `apps/backend`.

```bash
pnpm dlx deno@2.9.6 test --no-config --no-lock --node-modules-dir=none --allow-env --allow-read supabase/tests/*push*_test.ts
```

The tests run with an in-memory PostgreSQL instance and simulated Supabase and Expo HTTP responses. The first run downloads the test runtime and dependencies. Delivery to a real device is verified separately after activation.

## Activation

- Configure a random `PUSH_WORKER_SECRET` of at least 32 characters in the Edge Function environment. Schedule `push-worker` at least once per minute with Supabase Cron and pass that secret from Vault in the `x-push-worker-secret` header. Set `EXPO_ACCESS_TOKEN` if the Expo project requires authenticated push requests.
- In a signed-in native build, players can enable or disable notifications from profile settings. Katch asks for OS permission when they enable them, registers the Expo token, and opens the internal destination on tap. Disabling removes the registration. Katch attempts to remove the registration before signing out.
- Link the Expo project so its EAS project ID is available in the build, and configure APNs for iOS and FCM for Android. Install a development build to test remote delivery. The app uses the `daily-challenge` Android notification channel.
- For development, use the local Supabase stack and `pnpm --filter @katch/backend exec supabase functions serve --env-file <path-to-local-env>`. Call the worker with a POST request and an empty body or `{}`. Send only to devices enrolled for testing.

With the project URL and the worker secret stored in Vault as `project_url` and `push_worker_secret`, the Cron job can use this statement with `pg_net` enabled.

```sql
select net.http_post(
  url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
    || '/functions/v1/push-worker',
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'x-push-worker-secret',
    (select decrypted_secret from vault.decrypted_secrets where name = 'push_worker_secret')
  ),
  body := '{}'::jsonb
);
```

[Expo Push API](https://docs.expo.dev/push-notifications/sending-notifications/) · [Scheduling Supabase Edge Functions](https://supabase.com/docs/guides/functions/schedule-functions)

## Ownership

The Katch team owns registration, worker scheduling, and the rules that select recipients.

## Review

Revisit this decision if delivery throughput, retention needs, or provider capabilities outgrow the queue.
