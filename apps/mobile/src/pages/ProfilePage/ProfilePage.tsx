import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable } from "react-native";

import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import NavigationLink from "@/components/ui/NavigationLink";
import Screen from "@/components/ui/Screen";
import ThemedText from "@/components/ui/ThemedText";
import type { MyProfile } from "@/data/adapters/my-profile.adapters";
import { signOut } from "@/data/auth";
import { useAvatarCatalog } from "@/data/avatar-catalog-provider";
import { getMyProfile } from "@/data/my-profile";
import {
  disablePushNotifications,
  enablePushNotifications,
  pushNotificationsAvailable,
  pushNotificationsEnabled,
} from "@/data/push-notifications";
import { useSession } from "@/data/session-provider";

import { styles } from "./ProfilePage.styles";

export default function ProfilePage() {
  const { user } = useSession();
  const userId = user?.id;
  const { catalog } = useAvatarCatalog();
  const [profile, setProfile] = useState<MyProfile | null>(null);
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

  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController();
      getMyProfile(controller.signal).then(
        (loaded) => {
          if (!controller.signal.aborted) setProfile(loaded);
        },
        () => {},
      );
      return () => controller.abort();
    }, []),
  );

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOut(userId);
    } finally {
      setSigningOut(false);
    }
  }

  const avatar = catalog?.avatars.find(
    (item) => item.id === profile?.avatar.avatar,
  );
  const background = catalog?.backgrounds.find(
    (item) => item.id === profile?.avatar.background,
  );

  return (
    <Screen>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Modifier mon profil"
        onPress={() => router.push("/profil/modifier")}
        style={({ pressed }) => [styles.header, pressed && styles.pressed]}
      >
        <Avatar
          imageUrl={avatar?.imageUrl}
          backgroundHex={background?.hex}
          size={112}
        />
        {profile && (
          <ThemedText type="subtitle" style={styles.name}>
            {profile.displayName}
          </ThemedText>
        )}
      </Pressable>
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
