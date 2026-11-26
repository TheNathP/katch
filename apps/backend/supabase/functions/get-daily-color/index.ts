import { resolveUserId } from "../_shared/auth.ts";
import { scorePercentFromDeltaE } from "../_shared/color/analysis.ts";
import { createAdminClient } from "../_shared/db.ts";
import type { DailyColorResponse } from "../_shared/types.ts";

type DailyChallengeRow = {
  challenge_date: string;
  color_hex: string;
  ends_at: string;
  server_time: string;
};

type SubmissionRow = {
  score: number;
  matched_hex: string;
  delta_e: number;
};

const headers = { "Cache-Control": "no-store" };

Deno.serve(async (request) => {
  if (request.method !== "GET") {
    return Response.json(
      { error: "method_not_allowed" },
      {
        status: 405,
        headers: { ...headers, Allow: "GET" },
      },
    );
  }

  try {
    const admin = createAdminClient();
    const userId = await resolveUserId(request, admin);
    if (!userId) {
      return Response.json({ error: "unauthorized" }, { status: 401, headers });
    }
    if (new URL(request.url).search) {
      return Response.json(
        { error: "unexpected_query" },
        { status: 400, headers },
      );
    }

    const { data, error } = await admin
      .rpc("get_or_create_daily_challenge")
      .single()
      .overrideTypes<DailyChallengeRow, { merge: false }>();
    if (error || !data) throw new Error("Could not load daily challenge");

    // At most one row: each submission replaces the previous one of the day.
    const { data: submission, error: submissionError } = await admin
      .from("challenge_attempts")
      .select("score, matched_hex, delta_e")
      .eq("player_id", userId)
      .eq("challenge_date", data.challenge_date)
      .maybeSingle()
      .overrideTypes<SubmissionRow, { merge: false }>();
    if (submissionError) throw new Error("Could not load daily submission");

    return Response.json(
      {
        date: data.challenge_date,
        colorHex: data.color_hex,
        endsAt: data.ends_at,
        serverTime: data.server_time,
        submission: submission
          ? {
            score: submission.score,
            scorePercent: scorePercentFromDeltaE(submission.delta_e),
            matchedHex: submission.matched_hex,
          }
          : null,
      } satisfies DailyColorResponse,
      { headers },
    );
  } catch {
    console.error("Daily color request failed");
    return Response.json(
      { error: "daily_color_unavailable" },
      { status: 500, headers },
    );
  }
});
