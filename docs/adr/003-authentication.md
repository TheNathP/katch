# ADR-003: Email/Password Authentication with an Encrypted Session

**Status:** Proposed  
**Date:** 2026-11-24

## Decision

Players authenticate with **Supabase Auth** using **email + password** (`signUp` / `signInWithPassword`).

The Supabase session is stored **encrypted** on the device: a random AES-256 key per item lives in `expo-secure-store` (iOS Keychain / Android Keystore), and the session, encrypted with AES-GCM (`expo-crypto`), lives in the `expo-sqlite` key-value store.

## Background

Players need an account to keep their scores, streaks and friends. Our security model (ADR-002, CLAUDE.md) uses the Supabase client for authentication only: the JWT it holds is what Edge Functions use to identify the caller, so it has to be stored safely.

## Considerations

**Sign-in method:**

- **Passwordless OTP code by email**: it was considered. Email + password was chosen because players expect it and it doesn't depend on email delivery for each sign-in.
- **Google sign-in**: it is postponed. The native flow requires a development build and OAuth clients in Google Cloud, and we want a working email sign-in first.

**Session storage:**

- **SQLite `localStorage` / AsyncStorage**: these are the simplest options and the default in the Expo guide, but they store the refresh token in clear text.
- **SecureStore alone**: values over ~2 KB are refused by some iOS versions, and a session can exceed that.
- **Key in SecureStore + encrypted value in SQLite** (chosen): it is the "LargeSecureStore" pattern from the Supabase docs. It uses `expo-crypto`'s native AES-GCM instead of `aes-js`, so no extra JS crypto dependency is needed.

## Consequences

- All the modules used (`expo-secure-store`, `expo-crypto`, `expo-sqlite`) are bundled in Expo Go, so no development build is required yet.
- The app reads `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from `apps/mobile/.env.local` (gitignored, see `.env.example`).
- Sign-up with email confirmations enabled returns no session. The app tells the user to confirm their email, then sign in. Confirmation links that open the app (deep links) and password reset are not implemented yet.

## Ownership

The development team is responsible for the Supabase Auth settings and the mobile auth code (`apps/mobile/src/data/`).

## Review

This decision will be revisited when adding a social login (Google, and Sign in with Apple, which the App Store requires once a third-party login is offered on iOS), or if the encrypted storage causes session loss in practice.
