import {
  type AuthResult,
  toAuthErrorMessage,
  toSignUpErrorMessage,
} from "./adapters/auth.adapters";
import type { DeleteMyAccountRequest } from "./api.types";
import { callEdgeFunction } from "./edge-functions";
import { disablePushNotifications } from "./push-notifications";
import { supabase } from "./supabase";

export type SignUpProfile = {
  displayName: string;
  /** Omitted when the catalog could not be loaded: the server uses defaults. */
  avatar?: string;
  avatarBackground?: string;
};

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<AuthResult> {
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) return { status: "error", message: toAuthErrorMessage(error) };
  return { status: "signed-in" };
}

export async function signUpWithEmail(
  email: string,
  password: string,
  profile: SignUpProfile,
): Promise<AuthResult> {
  // The profile travels as user metadata; a database trigger validates it and
  // creates the `social_profiles` row, or rejects the whole sign-up.
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        display_name: profile.displayName.trim(),
        avatar: profile.avatar,
        avatar_background: profile.avatarBackground,
      },
    },
  });
  if (error) return { status: "error", message: toSignUpErrorMessage(error) };
  if (!data.session) return { status: "confirmation-required" };
  return { status: "signed-in" };
}

export async function signOut(userId?: string): Promise<void> {
  if (userId) await disablePushNotifications(userId).catch(() => {});
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function deleteMyAccount(confirmation: DeleteMyAccountRequest["confirmation"]): Promise<void> {
  const body: DeleteMyAccountRequest = { confirmation };
  await callEdgeFunction("delete-my-account", { method: "POST", body });
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) throw error;
}
