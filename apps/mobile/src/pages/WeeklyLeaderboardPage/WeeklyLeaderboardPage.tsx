import NavigationLink from '@/components/ui/NavigationLink';
import Screen from '@/components/ui/Screen';

export default function WeeklyLeaderboardPage() {
  return (
    <Screen>
      <NavigationLink href="/classement" label="Entre amis" replace />
      <NavigationLink href="/classement/mondial" label="Mondial" replace />
    </Screen>
  );
}
