import type { SubmitPhotoResponse } from '@/data/api.types';

/** A scored photo, as shown on the result screen. The score always comes from the server. */
export type ChallengeAttempt = {
  id: string;
  photoUri: string;
  targetHex: string;
  matchedHex: string;
  score: number;
  bestScore: number;
  attemptsLeft: number;
};

const HEX = /^#[0-9A-F]{6}$/;
const isScore = (value: unknown): value is number =>
  typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 100;

export function adaptChallengeAttempt(response: unknown, photoUri: string): ChallengeAttempt {
  const body = response as Partial<SubmitPhotoResponse> | null;
  if (
    typeof body !== 'object' || body === null ||
    typeof body.attemptId !== 'string' ||
    typeof body.targetHex !== 'string' || !HEX.test(body.targetHex) ||
    typeof body.matchedHex !== 'string' || !HEX.test(body.matchedHex) ||
    !isScore(body.score) || !isScore(body.bestScore) ||
    typeof body.attemptsLeft !== 'number' || body.attemptsLeft < 0
  ) {
    throw new Error('Invalid photo result');
  }
  return {
    id: body.attemptId,
    photoUri,
    targetHex: body.targetHex,
    matchedHex: body.matchedHex,
    score: body.score,
    bestScore: body.bestScore,
    attemptsLeft: body.attemptsLeft,
  };
}
