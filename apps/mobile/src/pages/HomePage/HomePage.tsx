import NavigationLink from '@/components/ui/NavigationLink';
import Screen from '@/components/ui/Screen';

export default function HomePage() {
  return (
    <Screen>
      <NavigationLink href="/defi" label="Capturer ma couleur" />
      <NavigationLink href="/classement" label="Classement du jour" />
      <NavigationLink href="/progression/serie" label="Ma série" />
      <NavigationLink href="/bienvenue" label="Découvrir Katch" />
    </Screen>
  );
}
