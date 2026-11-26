import { resolveUserId } from "../_shared/auth.ts";
import { createAdminClient } from "../_shared/db.ts";
import {
  parseProfileUpdate,
  PROFILE_COLUMNS,
  toMyProfileResponse,
} from "../_shared/profile.ts";

const headers = { "Cache-Control": "no-store" };
const MAX_BODY_LENGTH = 1024;

const UNIQUE_VIOLATION = "23505";
const FOREIGN_KEY_VIOLATION = "23503";

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

Deno.serve(async (request) => {
  if (request.method !== "PATCH") {
    return Response.json(
      { error: "method_not_allowed" },
      {
        status: 405,
        headers: { ...headers, Allow: "PATCH" },
      },
    );
  }

  try {
    const admin = createAdminClient();
    const playerId = await resolveUserId(request, admin);
    if (!playerId)
      return Response.json({ error: "unauthorized" }, { status: 401, headers });

    const body = await request.text();
    const update =
      new URL(request.url).search || body.length > MAX_BODY_LENGTH
        ? null
        : parseProfileUpdate(parseJson(body));
    if (!update)
      return Response.json(
        { error: "invalid_request" },
        { status: 400, headers },
      );

    const { data, error } = await admin
      .from("social_profiles")
      .update(update)
      .eq("player_id", playerId)
      .select(PROFILE_COLUMNS)
      .maybeSingle();

    if (error?.code === UNIQUE_VIOLATION) {
      return Response.json(
        { error: "display_name_taken" },
        { status: 409, headers },
      );
    }
    if (error?.code === FOREIGN_KEY_VIOLATION) {
      return Response.json(
        { error: "unknown_avatar" },
        { status: 400, headers },
      );
    }
    if (error) throw new Error("Could not update profile");
    if (!data)
      return Response.json(
        { error: "profile_not_found" },
        { status: 404, headers },
      );

    return Response.json(toMyProfileResponse(data), { headers });
  } catch {
    console.error("Update my profile request failed");
    return Response.json(
      { error: "profile_unavailable" },
      { status: 500, headers },
    );
  }
});
