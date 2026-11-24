import NavigationLink from '@/components/ui/NavigationLink';
import Screen from '@/components/ui/Screen';

export default function ChallengeResultPage() {
  return (
    <Screen>
      <NavigationLink href="/defi" label="Refaire le défi" dismissTo />
      <NavigationLink href="/defi/photos" label="Voir les photos du jour" />
    </Screen>
  );
}
