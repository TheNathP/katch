# Commit & Git rules

## Claude never commits

- **Never run `git commit`, `git push`, `git merge`, `git rebase`, `git reset`, `git tag` or `gh pr create`/`gh pr merge` yourself**, even if asked to "ship" or "finish" a task. Read-only commands (`git status`, `git diff`, `git log`, `git branch`) are fine.
- Don't run `git add` either — staging is part of the commit decision.
- When work is ready to commit, end your answer with a **ready-to-paste command block** the developer runs themselves:

```bash
git switch -c feat/camera-capture        # only if not already on a feature branch
git add src/app/play.tsx src/lib/color/distance.ts
git commit -m "feat(camera): capture photo and extract dominant color"
git push -u origin feat/camera-capture
```

- List files explicitly in `git add` (no `git add .` / `-A`), and only files related to the change. Never include `.env*`, credentials or generated folders (`ios/`, `android/`, `.expo/`).
- If the change mixes unrelated concerns, propose several commits, each with its own `git add` + `git commit`.
- If currently on `main`, the first command must create a branch.

## Branch naming

`<type>/<short-kebab-description>` in English, e.g. `feat/color-score`, `fix/camera-permission-android`, `chore/setup-prettier`.

## Commit messages — Conventional Commits

Format: `<type>(<optional scope>): <description>`

- Types: `feat`, `fix`, `refactor`, `perf`, `style`, `test`, `docs`, `chore`, `ci`, `build`.
- Description in English, imperative mood, lowercase, no trailing period, ≤ 72 chars (`add`, not `added`/`adds`).
- Scope = feature area: `camera`, `color`, `score`, `game`, `auth`, `supabase`, `ui`, `nav`, `deps`.
- Add a body (second `-m`) only when the *why* isn't obvious. Breaking changes: `feat(score)!: ...` plus a `BREAKING CHANGE:` line in the body.
- No Claude attribution / `Co-Authored-By` trailer.

## Pull requests

`main` is protected by convention: everything goes through a PR reviewed by another team member. When relevant, give the developer a suggested PR title (same format as a commit) and a short description (what / why / how to test) to paste — don't open it yourself.
