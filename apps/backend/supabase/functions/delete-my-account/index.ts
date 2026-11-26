import { resolveUserId } from "../_shared/auth.ts";
import { createAdminClient } from "../_shared/db.ts";
import type { DeleteMyAccountRequest } from "../_shared/types.ts";

const headers = { "Cache-Control": "no-store" };

function isConfirmation(body: unknown): body is DeleteMyAccountRequest {
  return typeof body === "object" && body !== null
    && Object.keys(body).length === 1 && "confirmation" in body
    && body.confirmation === "SUPPRIMER";
}

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return Response.json({ error: "method_not_allowed" }, { status: 405, headers: { ...headers, Allow: "POST" } });
  }

  try {
    const admin = createAdminClient();
    const playerId = await resolveUserId(request, admin);
    if (!playerId) return Response.json({ error: "unauthorized" }, { status: 401, headers });

    const body: unknown = await request.json().catch(() => null);
    if (new URL(request.url).search || !isConfirmation(body)) {
      return Response.json({ error: "invalid_request" }, { status: 400, headers });
    }

    const { error } = await admin.auth.admin.deleteUser(playerId);
    if (error) throw new Error("Could not delete account");
    return new Response(null, { status: 204, headers });
  } catch {
    console.error("Delete my account request failed");
    return Response.json({ error: "account_deletion_failed" }, { status: 500, headers });
  }
});
