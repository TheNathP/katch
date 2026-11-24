import NavigationLink from '@/components/ui/NavigationLink';
import Screen from '@/components/ui/Screen';

export default function CapturePage() {
  return (
    <Screen>
      <NavigationLink href="/defi/zone" label="Sélectionner la zone" />
      <NavigationLink href="/defi/import" label="Importer une photo" />
    </Screen>
  );
}
