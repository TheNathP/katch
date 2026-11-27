import type { SubmitPhotoResponse } from "@/data/api.types";

/** A scored photo, as shown on the result screen. The score always comes from the server. */
export type ChallengeAttempt = {
  id: string;
  photoUri: string;
  photoSize: { width: number; height: number };
  targetHex: string;
  matchedHex: string;
  matchedArea: PhotoArea | null;
  score: number;
  photoCoinsEarned: number;
};

export type PhotoArea = { x: number; y: number; width: number; height: number };

const HEX = /^#[0-9A-F]{6}$/;
const isScore = (value: unknown): value is number =>
  typeof value === "number" &&
  Number.isInteger(value) &&
  value >= 0 &&
  value <= 100;

const isFraction = (value: unknown): value is number =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value >= 0 &&
  value <= 1;

/** The area only decorates the result: an invalid one is dropped rather than failing the attempt. */
function adaptArea(area: unknown): PhotoArea | null {
  const body = area as Partial<PhotoArea> | null | undefined;
  if (
    typeof body !== "object" ||
    body === null ||
    !isFraction(body.x) ||
    !isFraction(body.y) ||
    !isFraction(body.width) ||
    !isFraction(body.height) ||
    body.width === 0 ||
    body.height === 0 ||
    body.x + body.width > 1.0001 ||
    body.y + body.height > 1.0001
  ) {
    return null;
  }
  return { x: body.x, y: body.y, width: body.width, height: body.height };
}

export function adaptChallengeAttempt(
  response: unknown,
  photo: { uri: string; width: number; height: number },
): ChallengeAttempt {
  const body = response as Partial<SubmitPhotoResponse> | null;
  if (
    typeof body !== "object" ||
    body === null ||
    typeof body.attemptId !== "string" ||
    typeof body.targetHex !== "string" ||
    !HEX.test(body.targetHex) ||
    typeof body.matchedHex !== "string" ||
    !HEX.test(body.matchedHex) ||
    !isScore(body.score)
  ) {
    throw new Error("Invalid photo result");
  }
  return {
    id: body.attemptId,
    photoUri: photo.uri,
    photoSize: { width: photo.width, height: photo.height },
    targetHex: body.targetHex,
    matchedHex: body.matchedHex,
    matchedArea: adaptArea(body.matchedArea),
    score: body.score,
    photoCoinsEarned: body.photoCoinsEarned === 5 || body.photoCoinsEarned === 10 ? body.photoCoinsEarned : 0,
  };
}
