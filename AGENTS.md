Katch is a pnpm monorepo: an Expo/React Native mobile app (iOS + Android only, no web) and a Supabase backend. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

```
apps/mobile/     → Expo app (@katch/mobile)
apps/backend/    → Supabase backend (@katch/backend): supabase/ with config, migrations, Edge Functions
docs/adr/        → Architecture Decision Records (English)
```

- Project rules: `.claude/rules/architecture.md` (mobile structure), `.claude/rules/backend.md` (Supabase), `.claude/rules/commits.md` (Git). Read the relevant one before writing code.
- Security model: the app never accesses the database directly (Supabase client is for auth only, everything goes through Edge Functions) and never computes a score — it uploads the photo, the server scores it. See `docs/adr/`.
- Never commit, push or open a pull request: give the developer the commands to run.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `apps/mobile/package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

The project uses **pnpm** (`pnpm-lock.yaml`): use `pnpm exec` / `pnpm dlx` instead of `npx`.

From the repo root:

```bash
pnpm install
pnpm mobile               # expo start (apps/mobile)
pnpm ios / pnpm android
pnpm lint                 # lint every workspace
pnpm typecheck            # tsc --noEmit in every workspace
pnpm db:start / db:stop   # local Supabase stack (Docker required)
```

From `apps/mobile/`:

```bash
pnpm exec expo install <package>  # ALWAYS use instead of pnpm add — resolves SDK-compatible versions
pnpm exec expo install --fix      # fix incompatible package versions
pnpm dlx expo-doctor              # diagnose dependency and config issues
```

Run `pnpm lint` and `pnpm typecheck` before declaring any task done.

## Monorepo

- Expo configures Metro for monorepos automatically — don't add `watchFolders` or `nodeModulesPaths` to a `metro.config.js`.
- Never have two versions of `react` or `react-native` in the repo (check with `pnpm why react-native`).
- Non-Expo dependencies: `pnpm --filter <workspace> add <package>`.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `apps/mobile/src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Route files only re-export a page from `src/pages/`; keep all non-route code outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI from `apps/mobile/` as `pnpm dlx eas-cli@latest <command>`; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- `apps/mobile/ios/` and `apps/mobile/android/` are generated (Continuous Native Generation) and gitignored. Never create or edit them by hand — configure native behavior in `apps/mobile/app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `pnpm exec expo run:ios|android` locally, or `eas build --profile development`. The choice between Expo Go and development builds is not made yet — flag it whenever a native dependency is added.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
