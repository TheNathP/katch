import NavigationLink from '@/components/ui/NavigationLink';
import Screen from '@/components/ui/Screen';

export default function SignInPage() {
  return (
    <Screen>
      <NavigationLink href="/compte/inscription" label="Créer un compte" variant="primarySolid" replace />
    </Screen>
  );
}
