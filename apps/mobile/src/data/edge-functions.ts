import { supabase } from "./supabase";

/** A non-2xx answer from an Edge Function, with the `error` code it returned. */
export class EdgeFunctionError extends Error {
  constructor(
    readonly status: number,
    readonly code: string | null,
  ) {
    super(`Edge Function failed with status ${status}${code ? ` (${code})` : ""}`);
  }
}

type EdgeFunctionRequest = {
  method: "GET" | "POST" | "PATCH";
  /** Sent as JSON, except a `FormData` which is sent as `multipart/form-data`. */
  body?: unknown;
  signal?: AbortSignal;
};

/**
 * Calls an Edge Function as the signed-in player and returns the raw JSON
 * body. Throws `EdgeFunctionError` (status 401 when there is no session).
 */
export async function callEdgeFunction(
  name: string,
  { method, body, signal }: EdgeFunctionRequest,
): Promise<unknown> {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");
  const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase configuration");

  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new EdgeFunctionError(401, "unauthorized");

  const response = await fetch(`${url}/functions/v1/${name}`, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${data.session.access_token}`,
      // FormData sets its own multipart Content-Type with the boundary.
      ...(body === undefined || body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    },
    body: body === undefined || body instanceof FormData ? body : JSON.stringify(body),
    signal,
  });

  const json: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const code =
      typeof json === "object" &&
      json !== null &&
      "error" in json &&
      typeof json.error === "string"
        ? json.error
        : null;
    throw new EdgeFunctionError(response.status, code);
  }
  return json;
}
