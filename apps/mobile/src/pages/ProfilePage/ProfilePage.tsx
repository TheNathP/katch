import NavigationLink from '@/components/ui/NavigationLink';
import Screen from '@/components/ui/Screen';

export default function ProfilePage() {
  return (
    <Screen>
      <NavigationLink href="/profil/modifier" label="Modifier mon profil" />
      <NavigationLink href="/amis" label="Mes amis" />
      <NavigationLink href="/progression" label="Ma progression" />
      <NavigationLink href="/historique" label="Historique des défis" />
      <NavigationLink href="/collection" label="Ma collection" />
      <NavigationLink href="/compte/connexion" label="Se connecter" />
    </Screen>
  );
}
