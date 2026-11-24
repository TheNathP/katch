# ADR-002: Adopting Supabase as Backend

**Status:** Accepted  
**Date:** 2026-11-24

## Decision

We have decided to use **Supabase** as the backend of the application: authentication, Postgres database, file storage and server-side logic (Edge Functions). The Supabase project lives in `apps/backend/supabase/` and is managed with the Supabase CLI.

## Background

Our application needs user accounts, a database to store games and scores, storage for the photos taken by players, and server-side code to compute scores securely.

As a team of three on a school project, we have no budget and limited time: we want a backend that is quick to set up and does not require managing our own servers.

## Considerations

We evaluated three approaches:

- **Custom API (Node + hosted Postgres):** Full control, but authentication, hosting, database and storage must all be set up and maintained by us.
- **Firebase:** Authentication, database and storage included, but Firestore is a NoSQL database, less suited to leaderboards and relational queries.
- **Supabase:** Free tier, easy to set up, built-in authentication, and the database, storage, server functions and admin dashboard are all hosted in the same place.

Supabase offers the best balance between setup speed, cost and features for our requirements.

## Consequences

- Authentication, database, storage and back-office are available immediately, with no infrastructure to manage.
- The database schema is versioned in the repository through SQL migrations.
- Edge Functions run on Deno, a different runtime from the mobile app.
- The free tier has limits (database size, storage, invocations, project paused after inactivity).
- Each developer needs Docker to run the local stack, and must link the hosted project once (`supabase login` then `supabase link`).
- The linked project is production: commands that modify it (`db push`, `functions deploy`…) must only be run deliberately.

## Ownership

The development team is responsible for the database schema, migrations, Edge Functions and the configuration of the Supabase project.

## Review

This decision will be revisited if the free tier limits are reached, or if Edge Functions cannot meet our server-side processing needs (such as photo color extraction).
