import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import Button from "@/components/ui/Button";
import NavigationLink from "@/components/ui/NavigationLink";
import Screen from "@/components/ui/Screen";
import ThemedText from "@/components/ui/ThemedText";
import type { MyProfile } from "@/data/adapters/my-profile.adapters";
import { signOut } from "@/data/auth";
import { useAvatarCatalog } from "@/data/avatar-catalog-provider";
import { getMyProfile } from "@/data/my-profile";

export default function ProfilePage() {
  const { catalog } = useAvatarCatalog();
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [signingOut, setSigningOut] = useState(false);

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
    await signOut();
    setSigningOut(false);
  }

  const avatar = catalog?.avatars.find(
    (item) => item.id === profile?.avatar.avatar,
  );
  const background = catalog?.backgrounds.find(
    (item) => item.id === profile?.avatar.background,
  );

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
      <Button
        label={signingOut ? "Déconnexion" : "Se déconnecter"}
        onPress={handleSignOut}
        disabled={signingOut}
      />
    </Screen>
  );
}
