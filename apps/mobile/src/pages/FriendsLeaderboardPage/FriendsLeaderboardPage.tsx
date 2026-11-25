import NavigationLink from '@/components/ui/NavigationLink';
import Screen from '@/components/ui/Screen';

export default function FriendsLeaderboardPage() {
  return (
    <Screen>
      <NavigationLink href="/classement" label="Mondial" replace />
      <NavigationLink href="/classement/hebdomadaire" label="Séries de la semaine" replace />
    </Screen>
  );
}
