import NavigationLink from '@/components/ui/NavigationLink';
import Screen from '@/components/ui/Screen';

export default function OnboardingPage() {
  return (
    <Screen>
      <NavigationLink href="/defi" label="Essayer le défi" dismissTo />
      <NavigationLink href="/compte/inscription" label="Créer un compte" />
      <NavigationLink href="/compte/connexion" label="Se connecter" />
    </Screen>
  );
}
