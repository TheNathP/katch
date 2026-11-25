import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import Button from "@/components/ui/Button";
import NavigationLink from "@/components/ui/NavigationLink";
import Screen from "@/components/ui/Screen";
import ThemedText from "@/components/ui/ThemedText";
import { signOut } from "@/data/auth";
import {
  disablePushNotifications,
  enablePushNotifications,
  pushNotificationsAvailable,
  pushNotificationsEnabled,
} from "@/data/push-notifications";
import { useSession } from "@/data/session-provider";

export default function ProfilePage() {
  const { user } = useSession();
  const userId = user?.id;
  const [signingOut, setSigningOut] = useState(false);
  const [pushEnabled, setPushEnabled] = useState<boolean>();
  const [updatingPush, setUpdatingPush] = useState(false);
  const [pushError, setPushError] = useState<string>();

  useFocusEffect(useCallback(() => {
    if (!userId || !pushNotificationsAvailable) return;
    let active = true;
    setPushEnabled(undefined);
    void pushNotificationsEnabled(userId).then(
      (enabled) => { if (active) setPushEnabled(enabled); },
      () => { if (active) setPushEnabled(false); },
    );
    return () => { active = false; };
  }, [userId]));

  async function handlePushToggle() {
    if (!userId || pushEnabled === undefined || updatingPush || signingOut) return;
    setUpdatingPush(true);
    setPushError(undefined);
    try {
      if (pushEnabled) {
        await disablePushNotifications(userId);
        setPushEnabled(false);
      } else {
        const enabled = await enablePushNotifications(userId);
        setPushEnabled(enabled);
        if (!enabled) setPushError("Autorise les notifications de Katch dans les réglages du téléphone.");
      }
    } catch {
      setPushError("Impossible de modifier les notifications. Réessaie.");
    } finally {
      setUpdatingPush(false);
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut(userId);
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <Screen>
      {user && (
        <ThemedText type="small" themeColor="textSecondary">
          Connecté en tant que {user.email ?? "joueur"}
        </ThemedText>
      )}
      <NavigationLink href="/profil/modifier" label="Modifier mon profil" />
      <NavigationLink href="/amis" label="Mes amis" />
      <NavigationLink href="/progression" label="Ma progression" />
      <NavigationLink href="/historique" label="Historique des défis" />
      <NavigationLink href="/collection" label="Ma collection" />
      {user && pushNotificationsAvailable && (
        <Button
          label={updatingPush ? "Mise à jour des notifications…" : pushEnabled ? "Désactiver les notifications" : "Activer les notifications"}
          onPress={handlePushToggle}
          disabled={pushEnabled === undefined || updatingPush || signingOut}
        />
      )}
      {pushError && (
        <ThemedText type="small" themeColor="danger" accessibilityRole="alert">
          {pushError}
        </ThemedText>
      )}
      <Button
        label={signingOut ? "Déconnexion" : "Se déconnecter"}
        onPress={handleSignOut}
        disabled={signingOut || updatingPush}
      />
    </Screen>
  );
}
