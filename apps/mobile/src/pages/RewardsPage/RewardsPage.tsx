import NavigationLink from '@/components/ui/NavigationLink';
import Screen from '@/components/ui/Screen';

export default function RewardsPage() {
  return (
    <Screen>
      <NavigationLink href="/recompenses/badges" label="Mes badges" />
      <NavigationLink href="/progression" label="Ma progression" />
    </Screen>
  );
}
