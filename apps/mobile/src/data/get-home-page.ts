import { adaptDailyChallenge } from "@/data/adapters/daily-color.adapters";
import { callEdgeFunction } from "@/data/edge-functions";

export async function getHomePage(signal: AbortSignal) {
  const response = await callEdgeFunction("get-daily-color", {
    method: "GET",
    signal,
  });
  return adaptDailyChallenge(response, performance.now());
}
