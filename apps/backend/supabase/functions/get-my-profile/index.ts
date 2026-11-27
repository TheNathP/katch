import { resolveUserId } from "../_shared/auth.ts";
import { createAdminClient } from "../_shared/db.ts";
import { PROFILE_COLUMNS, toMyProfileResponse } from "../_shared/profile.ts";
import type { MyProfileResponse, ProfileChallengeStats } from "../_shared/types.ts";

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
    const playerId = await resolveUserId(request, admin);
    if (!playerId)
      return Response.json({ error: "unauthorized" }, { status: 401, headers });

    if (new URL(request.url).search) {
      return Response.json(
        { error: "invalid_request" },
        { status: 400, headers },
      );
    }

    const [profile, stats] = await Promise.all([
      admin.from("social_profiles").select(PROFILE_COLUMNS).eq("player_id", playerId).maybeSingle(),
      admin.rpc("get_profile_challenge_stats", { p_player: playerId })
        .overrideTypes<ProfileChallengeStats, { merge: false }>(),
    ]);
    const { data, error } = profile;
    if (error) throw new Error("Could not load profile");
    if (!data)
      return Response.json(
        { error: "profile_not_found" },
        { status: 404, headers },
      );

    if (stats.error) console.error("Could not load profile challenge stats");
    const response: MyProfileResponse = {
      ...toMyProfileResponse(data),
      ...(stats.data && !stats.error ? { challengeStats: stats.data } : {}),
    };
    return Response.json(response, { headers });
  } catch {
    console.error("Get my profile request failed");
    return Response.json(
      { error: "profile_unavailable" },
      { status: 500, headers },
    );
  }
});
