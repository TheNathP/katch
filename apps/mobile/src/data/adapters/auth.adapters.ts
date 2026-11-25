import { isAuthError, type Session } from "@supabase/supabase-js";

export type AuthUser = {
  id: string;
  email: string | null;
};

export type AuthResult =
  | { status: "signed-in" }
  | { status: "confirmation-required" }
  | { status: "error"; message: string };

export function toAuthUser(session: Session | null): AuthUser | null {
  if (!session) return null;
  return { id: session.user.id, email: session.user.email ?? null };
}

const GENERIC_ERROR = "Une erreur est survenue. Réessaie dans un instant.";

const messagesByCode: Record<string, string> = {
  invalid_credentials: "Email ou mot de passe incorrect.",
  email_not_confirmed: "Confirme ton adresse email avant de te connecter.",
  user_already_exists: "Un compte existe déjà avec cet email.",
  email_exists: "Un compte existe déjà avec cet email.",
  email_address_invalid: "Adresse email invalide.",
  weak_password: "Mot de passe trop faible.",
  over_request_rate_limit:
    "Trop de tentatives. Patiente un peu avant de réessayer.",
  over_email_send_rate_limit:
    "Trop d’emails envoyés. Patiente un peu avant de réessayer.",
  signup_disabled: "Les inscriptions sont désactivées pour le moment.",
  user_banned: "Ce compte a été suspendu.",
};

export function toAuthErrorMessage(error: unknown): string {
  if (isAuthError(error) && error.code && error.code in messagesByCode) {
    return messagesByCode[error.code];
  }
  return GENERIC_ERROR;
}
