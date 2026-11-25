import NavigationLink from '@/components/ui/NavigationLink';
import Screen from '@/components/ui/Screen';

export default function GlobalLeaderboardPage() {
  return (
    <Screen contentInsetAdjustmentBehavior="automatic">
      <NavigationLink href="/classement/amis" label="Entre amis" replace />
      <NavigationLink href="/classement/hebdomadaire" label="Séries de la semaine" replace />
    </Screen>
  );
}
