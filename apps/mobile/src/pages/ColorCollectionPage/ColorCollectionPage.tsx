import { router } from 'expo-router';
import { View } from 'react-native';

import ArchiveFeedback from '@/components/ui/ArchiveFeedback';
import ArchiveHero from '@/components/ui/ArchiveHero';
import Button from '@/components/ui/Button';
import ColorCollection from '@/components/ui/ColorCollection';
import Screen from '@/components/ui/Screen';
import ThemedText from '@/components/ui/ThemedText';
import { getColorCollection } from '@/data/challenge-history';
import type { ColorCollection as CollectionData } from '@/data/color-collection';
import { useArchivePagination } from '@/hooks/use-archive-pagination';
import { useTheme } from '@/hooks/use-theme';

import { styles } from './ColorCollectionPage.styles';

const pix = require('@/assets/images/pix/star-eyes.png');

function appendColors(current: CollectionData, next: CollectionData): CollectionData {
  return { ...next, validatedColors: [...current.validatedColors, ...next.validatedColors] };
}

export default function ColorCollectionPage() {
  const theme = useTheme();
  const { data: collection, error, retry, adding, moreFailed, loadMore } =
    useArchivePagination('collection', getColorCollection, appendColors);

  return (
    <Screen backgroundColor={theme.dailyCanvas}>
      <View style={styles.layout}>
        <ArchiveHero
          title="Ma collection"
          detail={collection ? `${collection.validatedCount} couleur${collection.validatedCount === 1 ? '' : 's'} trouvée${collection.validatedCount === 1 ? '' : 's'}` : undefined}
          art={pix}
        />
        <ThemedText type="small" themeColor="dailyMuted">
          Une couleur rejoint ta collection à partir de 90 % sur le défi du jour.
        </ThemedText>
        {!collection ? (
          <ArchiveFeedback
            kind={error ? 'error' : 'loading'}
            title={error ? 'Collection indisponible' : 'Chargement de la collection'}
            action={error ? { label: 'Réessayer', run: retry } : undefined}
          />
        ) : collection.validatedColors.length ? (
          <ColorCollection collection={collection} />
        ) : (
          <ArchiveFeedback kind="empty" title="Ta première couleur t’attend"
            action={{ label: 'Voir le défi du jour', run: () => router.navigate('/') }} />
        )}
        {moreFailed && (
          <ThemedText accessibilityLiveRegion="polite" type="small" themeColor="dailyMuted" style={styles.center}>
            Impossible de charger les autres couleurs.
          </ThemedText>
        )}
        {collection?.nextCursor && (
          <Button
            label={adding ? 'Chargement…' : moreFailed ? 'Réessayer' : 'Voir plus de couleurs'}
            disabled={adding}
            onPress={() => void loadMore()}
            variant="primarySolid"
          />
        )}
      </View>
    </Screen>
  );
}
