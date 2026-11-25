import { useEffect, useState } from "react";
import { View } from "react-native";

import Button from "@/components/ui/Button";
import NavigationLink from "@/components/ui/NavigationLink";
import Screen from "@/components/ui/Screen";
import TextField from "@/components/ui/TextField";
import ThemedText from "@/components/ui/ThemedText";
import type { AuthResult } from "@/data/adapters/auth.adapters";
import type { AvatarCatalog } from "@/data/adapters/avatar-catalog.adapters";
import { signUpWithEmail } from "@/data/auth";
import {
  getCachedAvatarCatalog,
  refreshAvatarCatalog,
} from "@/data/avatar-catalog";
import { isValidEmail } from "@/lib/email";
import {
  DISPLAY_NAME_MAX_LENGTH,
  isChoiceInCatalog,
  randomAvatarChoice,
  validateDisplayName,
  type AvatarChoice,
} from "@/lib/profile";

import SignUpPageAvatarPicker from "./_page/SignUpPageAvatarPicker";
import { styles } from "./SignUpPage.styles";

const MIN_PASSWORD_LENGTH = 6;

export default function SignUpPage() {
  const [displayName, setDisplayName] = useState("");
  const [catalog, setCatalog] = useState<AvatarCatalog | null>(null);
  const [catalogFailed, setCatalogFailed] = useState(false);
  const [catalogAttempt, setCatalogAttempt] = useState(0);
  const [avatarChoice, setAvatarChoice] = useState<AvatarChoice | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let refreshed = false;

    function applyCatalog(next: AvatarCatalog) {
      setCatalog(next);
      setCatalogFailed(false);
      // Keep the player's pick when it still exists, otherwise draw a new one.
      setAvatarChoice((current) =>
        current && isChoiceInCatalog(current, next)
          ? current
          : randomAvatarChoice(next),
      );
    }

    getCachedAvatarCatalog().then((cached) => {
      if (cached && !refreshed && !controller.signal.aborted)
        applyCatalog(cached);
    });
    refreshAvatarCatalog(controller.signal).then(
      (fresh) => {
        refreshed = true;
        applyCatalog(fresh);
      },
      () => {
        if (!controller.signal.aborted) setCatalogFailed(true);
      },
    );

    return () => controller.abort();
  }, [catalogAttempt]);

  async function run(action: () => Promise<AuthResult>) {
    setPending(true);
    setError(null);
    const result = await action();
    setPending(false);

    if (result.status === "confirmation-required") setConfirmationSent(true);
    else if (result.status === "error") setError(result.message);
  }

  function handleEmailSignUp() {
    const displayNameError = validateDisplayName(displayName);
    if (displayNameError) {
      setError(displayNameError);
      return;
    }
    if (!email.trim() || !password) {
      setError("Renseigne ton email et un mot de passe.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Adresse email invalide.");
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(
        `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.`,
      );
      return;
    }
    if (password !== passwordConfirmation) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    run(() =>
      signUpWithEmail(email, password, {
        displayName,
        avatar: avatarChoice?.avatar,
        avatarBackground: avatarChoice?.background,
      }),
    );
  }

  if (confirmationSent) {
    return (
      <Screen>
        <ThemedText>
          Un email de confirmation a été envoyé à {email.trim()}. Clique sur le
          lien qu’il contient, puis reviens te connecter.
        </ThemedText>
        <NavigationLink href="/compte/connexion" label="Se connecter" replace />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.form}>
        <SignUpPageAvatarPicker
          catalog={catalog}
          loadFailed={catalogFailed}
          onRetry={() => {
            setCatalogFailed(false);
            setCatalogAttempt((attempt) => attempt + 1);
          }}
          value={avatarChoice}
          onChange={setAvatarChoice}
        />
        <TextField
          label="Pseudo"
          value={displayName}
          onChangeText={setDisplayName}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="nickname"
          textContentType="nickname"
          maxLength={DISPLAY_NAME_MAX_LENGTH}
          returnKeyType="next"
        />
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
          returnKeyType="next"
        />
        <TextField
          label="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
          textContentType="password"
          returnKeyType="next"
        />
        <TextField
          label="Confirmer le mot de passe"
          value={passwordConfirmation}
          onChangeText={setPasswordConfirmation}
          secureTextEntry
          autoComplete="new-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={handleEmailSignUp}
        />

        {error && (
          <ThemedText
            type="small"
            themeColor="danger"
            accessibilityRole="alert"
          >
            {error}
          </ThemedText>
        )}

        <Button
          label={pending ? "Création du compte" : "Créer mon compte"}
          onPress={handleEmailSignUp}
          disabled={pending}
        />
      </View>

      <NavigationLink
        href="/compte/connexion"
        label="Déjà un compte ? Se connecter"
        replace
      />
    </Screen>
  );
}
