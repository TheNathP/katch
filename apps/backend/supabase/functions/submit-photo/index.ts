import { decode, Image } from "https://deno.land/x/imagescript@1.3.0/mod.ts";

import { resolveUserId } from "../_shared/auth.ts";
import { analyzePhoto } from "../_shared/color/analysis.ts";
import { type AdminClient, createAdminClient } from "../_shared/db.ts";
import { EXTENSIONS, MIME_TYPES, readImageHeader } from "../_shared/image.ts";
import type { SubmitPhotoResponse } from "../_shared/types.ts";

const headers = { "Cache-Control": "no-store" };
const BUCKET = "challenge-photos";
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
// Multipart overhead on top of the photo (boundaries, field headers, takenAt).
const MAX_BODY_BYTES = MAX_PHOTO_BYTES + 16 * 1024;
const MIN_SIDE = 16;
const MAX_SIDE = 4096;
const MAX_TAKEN_AT_AGE_MS = 5 * 365 * 24 * 60 * 60 * 1000;
const MAX_CLOCK_SKEW_MS = 10 * 60 * 1000;
const ISO_DATE_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/;

type DailyChallengeRow = { challenge_date: string; color_hex: string };
type RecordedAttemptRow = {
  photo_coins_earned: number;
  submitted_at: string;
  /** Photo of the attempt this submission replaced, to delete from storage. */
  replaced_photo_path: string | null;
};

const fail = (status: number, error: string) =>
  Response.json({ error }, { status, headers });

/** Parses the optional `takenAt` field; `undefined` means invalid. */
function parseTakenAt(
  value: FormDataEntryValue | null,
  now: number,
): string | null | undefined {
  if (value === null) return null;
  if (typeof value !== "string" || !ISO_DATE_PATTERN.test(value))
    return undefined;
  const time = Date.parse(value);
  if (
    !Number.isFinite(time) ||
    time > now + MAX_CLOCK_SKEW_MS ||
    time < now - MAX_TAKEN_AT_AGE_MS
  )
    return undefined;
  return new Date(time).toISOString();
}

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return Response.json(
      { error: "method_not_allowed" },
      { status: 405, headers: { ...headers, Allow: "POST" } },
    );
  }

  let admin: AdminClient | undefined;
  let uploadedPath: string | undefined;
  try {
    admin = createAdminClient();
    const playerId = await resolveUserId(request, admin);
    if (!playerId) return fail(401, "unauthorized");

    // 1. Validate the whole input before doing any work.
    const contentLength = request.headers.get("Content-Length");
    if (
      new URL(request.url).search ||
      !request.headers.get("Content-Type")?.startsWith("multipart/form-data") ||
      (contentLength !== null &&
        !(Number(contentLength) > 0 && Number(contentLength) <= MAX_BODY_BYTES))
    ) {
      return fail(400, "invalid_request");
    }

    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return fail(400, "invalid_request");
    }
    const keys = [...form.keys()];
    if (
      keys.some((key) => key !== "photo" && key !== "takenAt") ||
      form.getAll("photo").length !== 1 ||
      form.getAll("takenAt").length > 1
    ) {
      return fail(400, "invalid_request");
    }
    const takenAt = parseTakenAt(form.get("takenAt"), Date.now());
    if (takenAt === undefined) return fail(400, "invalid_request");

    const photo = form.get("photo");
    if (
      !(photo instanceof File) ||
      photo.size === 0 ||
      photo.size > MAX_PHOTO_BYTES
    ) {
      return fail(400, "invalid_photo");
    }
    const bytes = new Uint8Array(await photo.arrayBuffer());
    // The format comes from the file bytes, never from the client-declared MIME type.
    const header = readImageHeader(bytes);
    if (
      !header ||
      header.width < MIN_SIDE ||
      header.height < MIN_SIDE ||
      header.width > MAX_SIDE ||
      header.height > MAX_SIDE
    ) {
      return fail(400, "invalid_photo");
    }

    // 2. Today's color is decided by the server.
    const { data: challenge, error: challengeError } = await admin
      .rpc("get_or_create_daily_challenge")
      .single()
      .overrideTypes<DailyChallengeRow, { merge: false }>();
    if (challengeError || !challenge)
      throw new Error("Could not load daily challenge");

    // 3. Decode and analyze the photo.
    let decoded: Awaited<ReturnType<typeof decode>>;
    try {
      decoded = await decode(bytes);
    } catch {
      return fail(400, "invalid_photo");
    }
    if (!(decoded instanceof Image)) return fail(400, "invalid_photo");
    let analysis: ReturnType<typeof analyzePhoto>;
    try {
      analysis = analyzePhoto(
        { width: decoded.width, height: decoded.height, data: decoded.bitmap },
        challenge.color_hex,
      );
    } catch {
      return fail(400, "invalid_photo");
    }

    // 4. Store the photo, then record the attempt (removing the photo if that fails).
    const attemptId = crypto.randomUUID();
    const path = `${playerId}/${challenge.challenge_date}/${attemptId}.${EXTENSIONS[header.format]}`;
    const { error: uploadError } = await admin.storage
      .from(BUCKET)
      .upload(path, bytes, {
        contentType: MIME_TYPES[header.format],
        upsert: false,
      });
    if (uploadError) throw new Error("Could not store photo");
    uploadedPath = path;

    const { data: recorded, error: recordError } = await admin
      .rpc("record_rewarded_challenge_attempt", {
        attempt_id: attemptId,
        attempt_player: playerId,
        attempt_date: challenge.challenge_date,
        attempt_photo_path: path,
        attempt_taken_at: takenAt,
        attempt_target_hex: challenge.color_hex,
        attempt_matched_hex: analysis.matchedHex,
        attempt_delta_e: Math.round(analysis.deltaE * 100) / 100,
        attempt_score: analysis.score,
      })
      .single()
      .overrideTypes<RecordedAttemptRow, { merge: false }>();

    if (recordError || !recorded) {
      await admin.storage
        .from(BUCKET)
        .remove([path])
        .catch(() => {});
      uploadedPath = undefined;
      if (recordError?.message === "challenge_ended")
        return fail(409, "challenge_ended");
      throw new Error("Could not record attempt");
    }
    uploadedPath = undefined;

    // Only the latest photo counts: delete the one it replaced so storage does not pile up.
    // Best effort, the attempt is already recorded.
    if (recorded.replaced_photo_path && recorded.replaced_photo_path !== path) {
      const { error: removeError } = await admin.storage
        .from(BUCKET)
        .remove([recorded.replaced_photo_path])
        .catch(() => ({ error: true }));
      if (removeError) console.error("Could not delete replaced photo");
    }

    return Response.json(
      {
        attemptId,
        challengeDate: challenge.challenge_date,
        targetHex: challenge.color_hex,
        matchedHex: analysis.matchedHex,
        matchedArea: analysis.matchedArea,
        score: analysis.score,
        photoCoinsEarned: recorded.photo_coins_earned,
        submittedAt: new Date(recorded.submitted_at).toISOString(),
        takenAt,
      } satisfies SubmitPhotoResponse,
      { headers },
    );
  } catch {
    if (admin && uploadedPath)
      await admin.storage
        .from(BUCKET)
        .remove([uploadedPath])
        .catch(() => {});
    console.error("Submit photo request failed");
    return fail(500, "photo_unavailable");
  }
});
