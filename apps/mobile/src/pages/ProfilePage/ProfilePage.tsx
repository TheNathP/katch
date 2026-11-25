import { useState } from "react";

import Button from "@/components/ui/Button";
import NavigationLink from "@/components/ui/NavigationLink";
import Screen from "@/components/ui/Screen";
import ThemedText from "@/components/ui/ThemedText";
import { signOut } from "@/data/auth";
import { useSession } from "@/data/session-provider";

export default function ProfilePage() {
  const { user } = useSession();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
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
      <Button
        label={signingOut ? "Déconnexion" : "Se déconnecter"}
        onPress={handleSignOut}
        disabled={signingOut}
      />
    </Screen>
  );
}
