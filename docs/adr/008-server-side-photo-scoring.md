# ADR-008 — Score challenge photos on the server

- **Status** — Scoring is available on `main`. The animated result is proposed in [PR 19](https://github.com/TheNathP/katch/pull/19).
- **Date** — 2026-11-26

## Context and constraints

The server needs to apply the same scoring rules to images received from iOS and Android. Scores feed the leaderboard and, with the rewards feature, coin credits. A photo can contain several colors, background objects, and reflections.

## Decision and alternatives

Before uploading, the app encodes the photo as JPEG and resizes it if its longest side exceeds 1,280 pixels. The server downsamples the image, compares its blocks to the target using the CIEDE2000 perceptual color distance, and returns the matched color, score, and area to highlight. The game rules use the integer score. The animation PR adds one decimal place for display and reuses the tutorial verdict. The two scan stops before the reticle settles on the returned area are part of the animation.

Scoring on the device could shorten the wait and allow offline analysis, but the server would still need to verify leaderboard submissions. An image-wide average could simplify the calculation, but it could blend the subject with the background. Identifying the main subject would require additional image processing.

## Consequences and limitations

Both platforms use the same scoring rules, and the reticle can highlight the area selected by the server. Submitting a photo depends on network access and server processing time. The method measures color similarity and can select a background object or reflection. A new attempt can replace the day's displayed result.
