import { File } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

import { adaptChallengeAttempt, type ChallengeAttempt } from '@/data/adapters/challenge-attempt.adapters';
import { callEdgeFunction, EdgeFunctionError } from '@/data/edge-functions';

export type { ChallengeAttempt };

/** Longest side of the uploaded photo: enough for the analysis, light on mobile data. */
const UPLOAD_MAX_SIDE = 1280;
const UPLOAD_QUALITY = 0.8;

export type SubmitPhotoErrorCode = 'attempt_limit_reached' | 'challenge_ended' | 'invalid_photo' | 'unknown';

export class SubmitPhotoError extends Error {
  constructor(readonly code: SubmitPhotoErrorCode) {
    super(`Photo submission failed (${code})`);
  }
}

// The last results, kept in memory so the result screen can show them without another request.
const attempts = new Map<string, ChallengeAttempt>();

export function getChallengeAttempt(id: string): ChallengeAttempt | undefined {
  return attempts.get(id);
}

/** Resizes the photo to `UPLOAD_MAX_SIDE` and re-encodes it as JPEG before upload. */
async function preparePhoto(uri: string): Promise<string> {
  const original = await ImageManipulator.manipulate(uri).renderAsync();
  const longest = Math.max(original.width, original.height);
  const image = longest > UPLOAD_MAX_SIDE
    ? await ImageManipulator.manipulate(original)
      .resize(original.width >= original.height ? { width: UPLOAD_MAX_SIDE } : { height: UPLOAD_MAX_SIDE })
      .renderAsync()
    : original;
  const saved = await image.saveAsync({ format: SaveFormat.JPEG, compress: UPLOAD_QUALITY });
  return saved.uri;
}

/**
 * Uploads the photo for today's challenge. The server stores it, extracts the color
 * closest to the target and returns the score: the app never computes or sends one.
 */
export async function submitChallengePhoto(photoUri: string, takenAt: string | null): Promise<ChallengeAttempt> {
  try {
    const uploadUri = await preparePhoto(photoUri);
    const form = new FormData();
    // The global fetch is expo/fetch: it uploads Blob-like files, not React Native's { uri } descriptors.
    form.append('photo', new File(uploadUri));
    if (takenAt) form.append('takenAt', takenAt);

    const attempt = adaptChallengeAttempt(
      await callEdgeFunction('submit-photo', { method: 'POST', body: form }),
      photoUri,
    );
    attempts.set(attempt.id, attempt);
    return attempt;
  } catch (error) {
    // The player only sees a generic message: log the real cause while developing.
    if (__DEV__) console.warn('submit-photo failed', error);
    if (error instanceof EdgeFunctionError &&
      (error.code === 'attempt_limit_reached' || error.code === 'challenge_ended' || error.code === 'invalid_photo')) {
      throw new SubmitPhotoError(error.code);
    }
    throw new SubmitPhotoError('unknown');
  }
}
