import { supabase, supabaseConfig } from "./supabase";

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
  method: "GET" | "POST" | "PATCH" | "DELETE";
  auth?: "public";
  /** Sent as JSON, except a `FormData` which is sent as `multipart/form-data`. */
  body?: unknown;
  signal?: AbortSignal;
  expectedUserId?: string;
};

/**
 * Calls an Edge Function and returns its raw JSON
 * body. Throws `EdgeFunctionError` (status 401 when there is no session).
 */
export async function callEdgeFunction(
  name: string,
  { method, auth, body, signal, expectedUserId }: EdgeFunctionRequest,
): Promise<unknown> {
  const { url, publishableKey } = supabaseConfig;
  const headers: Record<string, string> = { apikey: publishableKey };

  if (auth !== "public") {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session || (expectedUserId && data.session.user.id !== expectedUserId)) {
      throw new EdgeFunctionError(401, "unauthorized");
    }
    headers.Authorization = `Bearer ${data.session.access_token}`;
  }

  const multipart = body instanceof FormData;
  if (body !== undefined && !multipart) headers["Content-Type"] = "application/json";
  const response = await fetch(`${url}/functions/v1/${name}`, {
    method,
    headers,
    body: body === undefined || multipart ? body : JSON.stringify(body),
    signal,
  });

  const json: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const error = typeof json === "object" && json !== null
      ? json as { error?: unknown; code?: unknown }
      : undefined;
    const code = typeof error?.error === "string" ? error.error
      : typeof error?.code === "string" ? error.code : null;
    throw new EdgeFunctionError(response.status, code);
  }
  return json;
}
