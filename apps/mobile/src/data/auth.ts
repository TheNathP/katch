import { type AuthResult, toAuthErrorMessage } from "./adapters/auth.adapters";
import { supabase } from "./supabase";

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
): Promise<AuthResult> {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
  });
  if (error) return { status: "error", message: toAuthErrorMessage(error) };
  if (!data.session) return { status: "confirmation-required" };
  return { status: "signed-in" };
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}
