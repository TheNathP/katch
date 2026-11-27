import { File } from "expo-file-system";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";

import {
  adaptChallengeAttempt,
  type ChallengeAttempt,
} from "@/data/adapters/challenge-attempt.adapters";
import { cacheDailySubmission } from "@/data/daily-color-cache";
import { myProfileStore } from "@/data/my-profile";
import { rewardsStore } from "@/data/rewards-store";
import { callEdgeFunction, EdgeFunctionError } from "@/data/edge-functions";
import { discardTemporaryPhoto } from "@/lib/discard-temporary-photo";

export type { ChallengeAttempt };

/** Longest side of the uploaded photo: enough for the analysis, light on mobile data. */
const UPLOAD_MAX_SIDE = 1280;
const UPLOAD_QUALITY = 0.8;

export type SubmitPhotoErrorCode =
  | "challenge_ended"
  | "invalid_photo"
  | "photo_unreadable"
  | "unknown";

export class SubmitPhotoError extends Error {
  constructor(readonly code: SubmitPhotoErrorCode) {
    super(`Photo submission failed (${code})`);
  }
}

// A single result can be open in the capture flow.
let latestAttempt: ChallengeAttempt | undefined;
let lastCreditedAttemptId: string | undefined;
export type PhotoCoinReward = { amount: number; previousBalance?: number };
const pendingPhotoCoins = new Map<string, PhotoCoinReward>();

/** Home consumes each confirmed photo credit once, including after a retake. */
export function takePhotoCoins(accountId: string) {
  const coins = pendingPhotoCoins.get(accountId);
  pendingPhotoCoins.delete(accountId);
  return coins;
}

/** Drops the pending coin credit and the open result, deleting its temporary photo. */
export function clearChallengeAttempts(accountId: string) {
  pendingPhotoCoins.delete(accountId);
  if (latestAttempt) discardChallengeAttempt(latestAttempt.id);
}

export function getChallengeAttempt(id: string): ChallengeAttempt | undefined {
  return latestAttempt?.id === id ? latestAttempt : undefined;
}

export function discardChallengeAttempt(id: string) {
  if (latestAttempt?.id !== id) return;
  discardTemporaryPhoto(latestAttempt.photoUri);
  latestAttempt = undefined;
}

type PreparedPhoto = { uri: string; width: number; height: number };

async function preparePhoto(uri: string): Promise<PreparedPhoto> {
  const original = await ImageManipulator.manipulate(uri).renderAsync();
  const longest = Math.max(original.width, original.height);
  const image =
    longest > UPLOAD_MAX_SIDE
      ? await ImageManipulator.manipulate(original)
          .resize(
            original.width >= original.height
              ? { width: UPLOAD_MAX_SIDE }
              : { height: UPLOAD_MAX_SIDE },
          )
          .renderAsync()
      : original;
  const saved = await image.saveAsync({
    format: SaveFormat.JPEG,
    compress: UPLOAD_QUALITY,
  });
  return { uri: saved.uri, width: image.width, height: image.height };
}

/**
 * Uploads the photo for today's challenge. The server stores it, extracts the color
 * closest to the target and returns the score: the app never computes or sends one.
 * Each submission replaces the previous one of the day: only the latest photo counts.
 */
export async function submitChallengePhoto(
  photoUri: string,
  takenAt: string | null,
  accountId: string,
  signal?: AbortSignal,
): Promise<ChallengeAttempt> {
  const upload = await preparePhoto(photoUri).catch((error: unknown) => {
    if (__DEV__) console.warn("Could not prepare challenge photo", error);
    throw new SubmitPhotoError("photo_unreadable");
  });

  try {
    if (signal?.aborted) throw new Error("Photo submission aborted");
    const form = new FormData();
    // The global fetch is expo/fetch: it uploads Blob-like files, not React Native's { uri } descriptors.
    form.append("photo", new File(upload.uri));
    if (takenAt) form.append("takenAt", takenAt);

    const attempt = adaptChallengeAttempt(
      await callEdgeFunction("submit-photo", { method: "POST", body: form, expectedUserId: accountId, signal }),
      // The result shows the very image the server analyzed, so the matched area lines up with it.
      upload,
    );
    if (lastCreditedAttemptId !== attempt.id) {
      const wallet = rewardsStore(accountId);
      if (attempt.photoCoinsEarned > 0) {
        const previous = pendingPhotoCoins.get(accountId);
        pendingPhotoCoins.set(accountId, {
          amount: (previous?.amount ?? 0) + attempt.photoCoinsEarned,
          previousBalance: previous ? previous.previousBalance : wallet.snapshot().data?.coins,
        });
      }
      const { score, scorePercent, matchedHex } = attempt;
      cacheDailySubmission(accountId, attempt.challengeDate, { score, scorePercent, matchedHex });
      wallet.invalidate();
      myProfileStore(accountId).invalidate();
      lastCreditedAttemptId = attempt.id;
    }
    if (latestAttempt) discardChallengeAttempt(latestAttempt.id);
    latestAttempt = attempt;
    return attempt;
  } catch (error) {
    // The player only sees a generic message: log the real cause while developing.
    if (__DEV__) console.warn("submit-photo failed", error);
    if (
      error instanceof EdgeFunctionError &&
      (error.code === "challenge_ended" || error.code === "invalid_photo")
    ) {
      throw new SubmitPhotoError(error.code);
    }
    throw new SubmitPhotoError("unknown");
  } finally {
    if (latestAttempt?.photoUri !== upload.uri) discardTemporaryPhoto(upload.uri);
  }
}
