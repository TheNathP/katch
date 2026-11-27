# ADR-007 — Use Expo Go for the project demo

- **Status** — Accepted for the project demo
- **Date** — 2026-11-26

## Context and constraints

The team needed to demonstrate Katch on iOS and Android within a short delivery window and had already started development with Expo Go. On Android, a black band can appear in the camera preview when retaking a photo. The planned Google and Apple sign-in flows also need verification with Katch's app credentials, redirect configuration, and native capabilities.

## Decision and alternatives

Use Expo Go and email/password authentication for the demo. Defer Google and Apple sign-in to a later iteration. Keep the Android camera patch in the repository so it can be compiled into a Katch APK.

A dedicated development build would have let the team test the camera patch and integrate the sign-in providers for this delivery. It would also have required dependency changes, build and provider configuration, and another round of checks on both platforms within the remaining time. [Expo development builds](https://docs.expo.dev/develop/development-builds/introduction/)

## Consequences and limitations

The team can open the demo by scanning a QR code. Expo Go runs its own binary, so the Kotlin patch takes effect in an APK built for Katch. The photo picker provides another way to demonstrate the challenge. Expo Go supports some Apple Authentication testing on iOS. Testing Katch's own credentials and Sign in with Apple capability still requires a dedicated build. [Expo Apple Authentication](https://docs.expo.dev/versions/v58.0.0/sdk/apple-authentication/)

Related decisions cover [React Native and Expo](001-react-native-expo.md) and [email authentication](004-authentication.md).
