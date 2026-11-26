import { resolveUserId } from "../_shared/auth.ts";
import { createAdminClient } from "../_shared/db.ts";
import { PROFILE_COLUMNS, toMyProfileResponse } from "../_shared/profile.ts";

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

    const { data, error } = await admin
      .from("social_profiles")
      .select(PROFILE_COLUMNS)
      .eq("player_id", playerId)
      .maybeSingle();
    if (error) throw new Error("Could not load profile");
    if (!data)
      return Response.json(
        { error: "profile_not_found" },
        { status: 404, headers },
      );

    return Response.json(toMyProfileResponse(data), { headers });
  } catch {
    console.error("Get my profile request failed");
    return Response.json(
      { error: "profile_unavailable" },
      { status: 500, headers },
    );
  }
});
