import NavigationLink from '@/components/ui/NavigationLink';
import Screen from '@/components/ui/Screen';

export default function FriendsPage() {
  return (
    <Screen>
      <NavigationLink href="/amis/recherche" label="Rechercher des amis" />
      <NavigationLink href="/classement/amis" label="Classement entre amis" />
    </Screen>
  );
}
