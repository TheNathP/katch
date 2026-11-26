import type { ChallengeHistoryEntry, ChallengeHistoryResponse, ColorCollectionResponse, PhotoGalleryResponse } from '@/data/api.types';
import type { ColorCollection } from '@/data/color-collection';
import { isChallengeDate, isChallengeMonth } from '@/lib/challenge-calendar';

export type ChallengeResult = ChallengeHistoryEntry;
export type ChallengeHistory = { today: string; firstMonth: string; entries: ChallengeResult[] };
export type PhotoGallery = { entries: ChallengeResult[]; nextCursor: string | null };

const isHex = (hex: unknown): hex is string => typeof hex === 'string' && /^#[0-9A-F]{6}$/.test(hex);
const isScore = (score: unknown): score is number =>
  typeof score === 'number' && Number.isFinite(score) && score >= 0 && score <= 100;
const isCount = (count: unknown): count is number =>
  typeof count === 'number' && Number.isInteger(count) && count >= 0;
const isCursor = (value: unknown): value is string | null => value === null || isChallengeDate(value);

function adaptEntries(entries: ChallengeHistoryEntry[]): ChallengeResult[] {
  return entries.map((entry): ChallengeResult => {
    if (!entry || !isChallengeDate(entry.date) || !isScore(entry.score) ||
      !(entry.targetHex === null || isHex(entry.targetHex)) ||
      typeof entry.collected !== 'boolean') throw new Error('Invalid challenge result');

    return {
      date: entry.date,
      score: entry.score,
      targetHex: entry.targetHex,
      collected: entry.collected,
      photoUrl: typeof entry.photoUrl === 'string' && /^https?:\/\//.test(entry.photoUrl) ? entry.photoUrl : null,
    };
  });
}

export function adaptChallengeHistory(response: unknown): ChallengeHistory {
  const history = response as Partial<ChallengeHistoryResponse> | null;
  if (!history || !isChallengeDate(history.today) || !isChallengeMonth(history.firstMonth) ||
    !Array.isArray(history.entries)) throw new Error('Invalid challenge history');

  return { today: history.today, firstMonth: history.firstMonth, entries: adaptEntries(history.entries) };
}

export function adaptPhotoGallery(response: unknown): PhotoGallery {
  const gallery = response as Partial<PhotoGalleryResponse> | null;
  if (!gallery || !Array.isArray(gallery.entries) || !isCursor(gallery.nextCursor)) {
    throw new Error('Invalid photo gallery');
  }
  return { entries: adaptEntries(gallery.entries), nextCursor: gallery.nextCursor };
}

export function adaptColorCollection(response: unknown): ColorCollection {
  const collection = response as Partial<ColorCollectionResponse> | null;
  if (!collection || !isCount(collection.offeredCount) || !isCount(collection.validatedCount) ||
    !Array.isArray(collection.validatedColors) ||
    !isCursor(collection.nextCursor)) {
    throw new Error('Invalid color collection');
  }

  return {
    offeredCount: collection.offeredCount,
    validatedCount: collection.validatedCount,
    nextCursor: collection.nextCursor,
    validatedColors: collection.validatedColors.map((color) => {
      if (!color || !isChallengeDate(color.date) || !isHex(color.hex) || !isScore(color.score)) {
        throw new Error('Invalid collected color');
      }
      return { date: color.date, hex: color.hex, score: color.score };
    }),
  };
}
