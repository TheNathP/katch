import NavigationLink from '@/components/ui/NavigationLink';
import Screen from '@/components/ui/Screen';

export default function SignUpPage() {
  return (
    <Screen>
      <NavigationLink href="/compte/connexion" label="Se connecter" replace />
    </Screen>
  );
}
