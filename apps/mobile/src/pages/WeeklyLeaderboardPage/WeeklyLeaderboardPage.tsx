import NavigationLink from '@/components/ui/NavigationLink';
import Screen from '@/components/ui/Screen';

export default function WeeklyLeaderboardPage() {
  return (
    <Screen contentInsetAdjustmentBehavior="automatic">
      <NavigationLink href="/classement" label="Mondial" replace />
      <NavigationLink href="/classement/amis" label="Entre amis" replace />
    </Screen>
  );
}
