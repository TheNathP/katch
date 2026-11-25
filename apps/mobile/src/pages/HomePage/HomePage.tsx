import NavigationLink from '@/components/ui/NavigationLink';
import Screen from '@/components/ui/Screen';

// Onboarding is shown to signed-out players by the root layout's route guard.
export default function HomePage() {
  return (
    <Screen>
      <NavigationLink href="/defi" label="Capturer ma couleur" variant="primarySolid" />
      <NavigationLink href="/classement" label="Classement du jour" />
      <NavigationLink href="/progression/serie" label="Ma série" />
    </Screen>
  );
}
