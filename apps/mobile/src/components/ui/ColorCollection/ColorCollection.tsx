import { Image } from 'expo-image';
import { ScrollView, View } from 'react-native';

import NavigationLink from '@/components/ui/NavigationLink';
import ThemedText from '@/components/ui/ThemedText';
import type { CollectedColor, ColorCollection as CollectionData } from '@/data/color-collection';
import { useTheme } from '@/hooks/use-theme';
import { formatChallengeScore, formatShortChallengeDay } from '@/lib/challenge-calendar';

import { styles, tileGap, tileWidth } from './ColorCollection.styles';

const lock = require('@/assets/icons/lock.svg');
const emptyTiles = ['first', 'second', 'third', 'fourth', 'fifth'];

export function CollectionTile({ color, preview = false }: { color: CollectedColor; preview?: boolean }) {
  const theme = useTheme();
  const { date, hex, score } = color;
  const dayLabel = formatShortChallengeDay(date);
  const scoreLabel = formatChallengeScore(score);

  return (
    <NavigationLink
      href={{ pathname: '/historique/[date]', params: { date } }}
      label={`Couleur ${hex}, ${dayLabel}, ${scoreLabel}`}
      variant="plain"
      style={[
        styles.tile, !preview && styles.gridTile,
        { backgroundColor: theme.dailyCard, borderColor: theme.dailyBorder },
      ]}>
      <View aria-hidden style={[styles.swatch, !preview && styles.fullSwatch, { backgroundColor: hex, borderColor: theme.dailySwatchBorder }]}>
        {!preview && <ThemedText style={styles.score}>{scoreLabel}</ThemedText>}
      </View>
      <ThemedText type="smallBold" aria-hidden style={[styles.hex, { color: theme.dailyInk }]}>{hex}</ThemedText>
      {!preview && <ThemedText type="small" aria-hidden themeColor="dailyMuted" style={styles.date}>{dayLabel}</ThemedText>}
    </NavigationLink>
  );
}

export function CollectionHeading({ collection, preview = false }: { collection?: CollectionData; preview?: boolean }) {
  const theme = useTheme();
  return (
    <View style={styles.header}>
      {preview ? (
        <ThemedText accessibilityRole="header" style={[styles.title, { color: theme.dailyInk }]}>Ma collection</ThemedText>
      ) : <ThemedText accessibilityRole="header" type="smallBold">Couleurs validées</ThemedText>}
      {collection && (
        <ThemedText
          accessibilityLabel={`${collection.validatedCount} couleurs validées sur ${collection.offeredCount} proposées depuis ton inscription`}
          type="smallBold"
          style={[styles.count, { color: theme.dailyInk }]}>
          {collection.validatedCount} / {collection.offeredCount}
        </ThemedText>
      )}
    </View>
  );
}

export default function ColorCollection({ collection }: { collection?: CollectionData }) {
  const theme = useTheme();
  const colors = collection?.validatedColors.slice(0, 8) ?? [];

  return (
    <View style={styles.section}>
      <CollectionHeading collection={collection} preview />
      <ScrollView
        horizontal
        decelerationRate="fast"
        snapToInterval={tileWidth + tileGap}
        showsHorizontalScrollIndicator={false}
        accessibilityLabel={colors.length ? 'Aperçu des couleurs validées' : 'Emplacements de la collection'}
        contentContainerStyle={styles.rail}>
        {colors.length ? colors.map(color => <CollectionTile key={color.date} color={color} preview />) : emptyTiles.map(key => (
          <View
            key={key}
            aria-hidden
            style={[styles.emptyTile, { backgroundColor: theme.dailySurface, borderColor: theme.dailyBorder }]}>
            <Image aria-hidden source={lock} style={styles.lock} tintColor={theme.dailyMuted} contentFit="contain" />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
