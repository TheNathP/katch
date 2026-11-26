import ColorCollection from '@/components/ui/ColorCollection';
import Screen from '@/components/ui/Screen';
import { emptyColorCollection } from '@/data/color-collection';
import { useTheme } from '@/hooks/use-theme';

export default function ColorCollectionPage() {
  const theme = useTheme();

  return (
    <Screen backgroundColor={theme.dailyCanvas}>
      <ColorCollection collection={emptyColorCollection} />
    </Screen>
  );
}
