// Photo analysis: downscale the decoded photo into blocks of pixels, then keep the
// block whose average color is the closest to the daily target. Pure functions.
import { deltaE2000, hexToRgb, type Rgb, rgbToHex, rgbToLab } from './color.ts';

/** A decoded image: RGBA bytes, row by row (4 bytes per pixel). */
export type RgbaBitmap = { width: number; height: number; data: Uint8Array | Uint8ClampedArray };

/** Number of blocks along the longest side once the photo is downscaled. */
export const ANALYSIS_SIZE = 64;
/** CIEDE2000 distance at (and above) which the score drops to 0. */
export const ZERO_SCORE_DELTA_E = 50;
/** Pixels more transparent than this are ignored (PNG with an alpha channel). */
const MIN_ALPHA = 128;

export type PhotoAnalysis = {
  matchedHex: string;
  deltaE: number;
  score: number;
};

/**
 * Downscales the bitmap: each block of `blockSize` x `blockSize` pixels becomes one
 * color, the average of its opaque pixels. Averaging removes sensor noise and
 * isolated pixels, so a match has to cover a visible area of the photo.
 */
export function downscale(bitmap: RgbaBitmap, size = ANALYSIS_SIZE): Rgb[] {
  const { width, height, data } = bitmap;
  if (width <= 0 || height <= 0 || data.length < width * height * 4) throw new Error('Invalid bitmap');
  const blockSize = Math.max(1, Math.ceil(Math.max(width, height) / size));
  const blocks: Rgb[] = [];

  for (let top = 0; top < height; top += blockSize) {
    for (let left = 0; left < width; left += blockSize) {
      let r = 0, g = 0, b = 0, count = 0;
      const bottom = Math.min(top + blockSize, height);
      const right = Math.min(left + blockSize, width);
      for (let y = top; y < bottom; y++) {
        for (let i = (y * width + left) * 4, end = (y * width + right) * 4; i < end; i += 4) {
          if (data[i + 3] < MIN_ALPHA) continue;
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }
      }
      if (count > 0) blocks.push({ r: r / count, g: g / count, b: b / count });
    }
  }
  return blocks;
}

/** Linear score: 100 for an exact match, 0 from `ZERO_SCORE_DELTA_E` onwards. */
export function scoreFromDeltaE(deltaE: number): number {
  return Math.round(100 * Math.max(0, 1 - deltaE / ZERO_SCORE_DELTA_E));
}

/** Goes through every block of the downscaled photo and keeps the closest one to the target. */
export function analyzePhoto(bitmap: RgbaBitmap, targetHex: string): PhotoAnalysis {
  const target = rgbToLab(hexToRgb(targetHex));
  let best: Rgb | undefined;
  let bestDelta = Infinity;

  for (const block of downscale(bitmap)) {
    const delta = deltaE2000(target, rgbToLab(block));
    if (delta < bestDelta) {
      bestDelta = delta;
      best = block;
    }
  }
  if (!best) throw new Error('The photo has no opaque pixel');

  return { matchedHex: rgbToHex(best), deltaE: bestDelta, score: scoreFromDeltaE(bestDelta) };
}
