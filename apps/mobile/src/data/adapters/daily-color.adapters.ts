import type { DailyColorResponse } from "@/data/api.types";

export type DailyColor = {
  date: string;
  hex: string;
  refreshAt: number;
};

export type DailySubmission = {
  score: number;
  matchedHex: string;
};

export type DailyChallenge = {
  color: DailyColor;
  submission: DailySubmission | null;
};

const HEX = /^#[0-9A-F]{6}$/;

function adaptSubmission(submission: unknown): DailySubmission | null {
  if (submission === null) return null;
  const body = submission as Partial<DailySubmission> | undefined;
  if (
    typeof body !== "object" ||
    typeof body.score !== "number" ||
    !Number.isInteger(body.score) ||
    body.score < 0 ||
    body.score > 100 ||
    typeof body.matchedHex !== "string" ||
    !HEX.test(body.matchedHex)
  ) {
    throw new Error("Invalid daily submission");
  }
  return { score: body.score, matchedHex: body.matchedHex };
}

export function adaptDailyChallenge(
  response: unknown,
  receivedAt: number,
): DailyChallenge {
  const body = response as Partial<DailyColorResponse> | null;
  if (
    typeof body !== "object" ||
    body === null ||
    typeof body.date !== "string" ||
    typeof body.colorHex !== "string" ||
    typeof body.endsAt !== "string" ||
    typeof body.serverTime !== "string"
  ) {
    throw new Error("Invalid daily color response");
  }

  const remainingMs = Date.parse(body.endsAt) - Date.parse(body.serverTime);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(body.date) ||
    !HEX.test(body.colorHex) ||
    !Number.isFinite(remainingMs) ||
    remainingMs <= 0 ||
    remainingMs > 24 * 60 * 60 * 1_000
  ) {
    throw new Error("Invalid daily color response");
  }

  return {
    color: {
      date: body.date,
      hex: body.colorHex,
      refreshAt: receivedAt + remainingMs,
    },
    submission: adaptSubmission(body.submission ?? null),
  };
}
