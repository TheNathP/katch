import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import Avatar from "@/components/ui/Avatar";
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
      <NavigationLink
        href="/profil/modifier"
        variant="plain"
        label={
          profile
            ? `${profile.displayName}, modifier mon profil`
            : "Modifier mon profil"
        }
      >
        <Avatar
          imageUrl={avatar?.imageUrl}
          backgroundHex={background?.hex}
          size={96}
        />
        {profile && (
          <ThemedText type="subtitle">{profile.displayName}</ThemedText>
        )}
      </NavigationLink>

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
