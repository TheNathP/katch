// Photo analysis: downscale the decoded photo into blocks of pixels, then score the
// part of the photo (a minimum share of its blocks) closest to the daily target. Pure functions.
import { deltaE2000, hexToRgb, type Rgb, rgbToHex, rgbToLab } from "./color.ts";

/** A decoded image: RGBA bytes, row by row (4 bytes per pixel). */
export type RgbaBitmap = {
  width: number;
  height: number;
  data: Uint8Array | Uint8ClampedArray;
};

/** Number of blocks along the longest side once the photo is downscaled. */
export const ANALYSIS_SIZE = 64;
/** CIEDE2000 distance at (and below) which the score is 100: the eye can't see the difference. */
export const PERFECT_DELTA_E = 1;
/** CIEDE2000 distance at (and above) which the score drops to 0. */
export const ZERO_SCORE_DELTA_E = 30;
/**
 * Share of the photo the matched color has to cover. The scored distance is the average
 * over that many closest blocks, so a small patch of the right color in a busy scene
 * isn't enough: the player has to frame an object of that color.
 */
export const MIN_MATCH_AREA = 0.05;
/** Pixels more transparent than this are ignored (PNG with an alpha channel). */
const MIN_ALPHA = 128;
/**
 * Blocks this close to the best one look the same color: the area shown to the player is
 * the most central of them, so a plain photo points at its middle rather than a corner.
 */
const SAME_COLOR_DELTA_E = 2;

/** A rectangle of the photo, in fractions (0 to 1) of its width and height. */
export type PhotoArea = { x: number; y: number; width: number; height: number };

/** One downscaled block: the average color of its opaque pixels and where it is. */
export type PhotoBlock = { color: Rgb; area: PhotoArea };

export type PhotoAnalysis = {
  matchedHex: string;
  matchedArea: PhotoArea;
  deltaE: number;
  score: number;
};

const fraction = (value: number) => Math.round(value * 10_000) / 10_000;

/**
 * Downscales the bitmap: each block of `blockSize` x `blockSize` pixels becomes one
 * color, the average of its opaque pixels. Averaging removes sensor noise and
 * isolated pixels, so a match has to cover a visible area of the photo.
 */
export function downscale(
  bitmap: RgbaBitmap,
  size = ANALYSIS_SIZE,
): PhotoBlock[] {
  const { width, height, data } = bitmap;
  if (width <= 0 || height <= 0 || data.length < width * height * 4)
    throw new Error("Invalid bitmap");
  const blockSize = Math.max(1, Math.ceil(Math.max(width, height) / size));
  const blocks: PhotoBlock[] = [];

  for (let top = 0; top < height; top += blockSize) {
    for (let left = 0; left < width; left += blockSize) {
      let r = 0,
        g = 0,
        b = 0,
        count = 0;
      const bottom = Math.min(top + blockSize, height);
      const right = Math.min(left + blockSize, width);
      for (let y = top; y < bottom; y++) {
        for (
          let i = (y * width + left) * 4, end = (y * width + right) * 4;
          i < end;
          i += 4
        ) {
          if (data[i + 3] < MIN_ALPHA) continue;
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }
      }
      if (count === 0) continue;
      blocks.push({
        color: { r: r / count, g: g / count, b: b / count },
        area: {
          x: fraction(left / width),
          y: fraction(top / height),
          width: fraction((right - left) / width),
          height: fraction((bottom - top) / height),
        },
      });
    }
  }
  return blocks;
}

/**
 * Quadratic score: 100 up to `PERFECT_DELTA_E`, 0 from `ZERO_SCORE_DELTA_E` onwards. The
 * curve drops fast at first, so a high score takes a really close shade (~50 at deltaE 10).
 */
function rawScoreFromDeltaE(deltaE: number): number {
  const progress = Math.min(
    1,
    Math.max(0, deltaE - PERFECT_DELTA_E) /
      (ZERO_SCORE_DELTA_E - PERFECT_DELTA_E),
  );
  return 100 * (1 - progress) ** 2;
}

export function scoreFromDeltaE(deltaE: number): number {
  return Math.round(rawScoreFromDeltaE(deltaE));
}

/** Keep the first decimal for display, with a tolerance for binary floating point. */
export function scorePercentFromDeltaE(deltaE: number): number {
  // Stored attempts already use hundredths of Delta E; match their display on the result page.
  const recordedDeltaE = Math.round(deltaE * 100) / 100;
  return Math.trunc(rawScoreFromDeltaE(recordedDeltaE) * 10 + 1e-9) / 10;
}

/**
 * Goes through every block of the downscaled photo and scores the `MIN_MATCH_AREA` share of
 * blocks closest to the target: their average distance and average color.
 */
export function analyzePhoto(
  bitmap: RgbaBitmap,
  targetHex: string,
): PhotoAnalysis {
  const target = rgbToLab(hexToRgb(targetHex));
  const blocks = downscale(bitmap).map((block) => ({
    ...block,
    delta: deltaE2000(target, rgbToLab(block.color)),
  }));
  if (blocks.length === 0) throw new Error("The photo has no opaque pixel");
  const closest = [...blocks].sort((a, b) => a.delta - b.delta);
  const best = closest[0];
  const matched = closest.slice(
    0,
    Math.max(1, Math.ceil(blocks.length * MIN_MATCH_AREA)),
  );
  const deltaE =
    matched.reduce((sum, block) => sum + block.delta, 0) / matched.length;
  const matchedColor = matched.reduce(
    (sum, { color }) => ({
      r: sum.r + color.r / matched.length,
      g: sum.g + color.g / matched.length,
      b: sum.b + color.b / matched.length,
    }),
    { r: 0, g: 0, b: 0 },
  );

  // Among the blocks of the same color as the best one, point at the one closest to their middle.
  const bestDelta = best.delta;
  const similar = blocks.filter(
    (block) => block.delta <= bestDelta + SAME_COLOR_DELTA_E,
  );
  const centerOf = ({ area }: PhotoBlock) => ({
    x: area.x + area.width / 2,
    y: area.y + area.height / 2,
  });
  const middle = similar.reduce(
    (sum, block) => {
      const center = centerOf(block);
      return {
        x: sum.x + center.x / similar.length,
        y: sum.y + center.y / similar.length,
      };
    },
    { x: 0, y: 0 },
  );
  const distance = (block: PhotoBlock) => {
    const center = centerOf(block);
    return (center.x - middle.x) ** 2 + (center.y - middle.y) ** 2;
  };
  const shown = similar.reduce((closest, block) =>
    distance(block) < distance(closest) ? block : closest,
  );

  return {
    matchedHex: rgbToHex(matchedColor),
    matchedArea: shown.area,
    deltaE,
    score: scoreFromDeltaE(deltaE),
  };
}
