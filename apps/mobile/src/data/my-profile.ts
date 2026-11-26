import {
  adaptMyProfile,
  toUpdateMyProfileRequest,
  type MyProfile,
  type MyProfileChanges,
} from "@/data/adapters/my-profile.adapters";
import { callEdgeFunction } from "@/data/edge-functions";

/** The signed-in player's display name and profile picture. */
export async function getMyProfile(signal?: AbortSignal): Promise<MyProfile> {
  return adaptMyProfile(
    await callEdgeFunction("get-my-profile", { method: "GET", signal }),
  );
}

/** Saves the changed fields; the server validates them and returns the profile. */
export async function updateMyProfile(
  changes: MyProfileChanges,
): Promise<MyProfile> {
  return adaptMyProfile(
    await callEdgeFunction("update-my-profile", {
      method: "PATCH",
      body: toUpdateMyProfileRequest(changes),
    }),
  );
}
