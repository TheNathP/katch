import { Image } from 'expo-image';
import { ScrollView, View } from 'react-native';

import ThemedText from '@/components/ui/ThemedText';
import type { ColorCollection as CollectionData } from '@/data/color-collection';
import { useTheme } from '@/hooks/use-theme';

import { styles, tileGap, tileWidth } from './ColorCollection.styles';

const lock = require('@/assets/icons/lock.svg');
const emptyTiles = ['first', 'second', 'third', 'fourth', 'fifth'];

type Props = {
  collection: CollectionData;
  preview?: boolean;
};

export default function ColorCollection({ collection, preview = false }: Props) {
  const theme = useTheme();
  const { validatedColors, offeredCount } = collection;
  const colors = preview ? validatedColors.slice(0, 8) : validatedColors;
  const tiles = colors.map(({ id, hex }) => (
    <View
      key={id}
      accessible
      accessibilityLabel={`Couleur ${hex}`}
      style={[
        styles.tile, !preview && styles.gridTile,
        { backgroundColor: theme.dailyCard, borderColor: theme.dailyBorder },
      ]}>
      <View aria-hidden style={[styles.swatch, { backgroundColor: hex }]} />
      <ThemedText type="smallBold" aria-hidden style={[styles.hex, { color: theme.dailyInk }]}>{hex}</ThemedText>
    </View>
  ));

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        {preview ? (
          <ThemedText accessibilityRole="header" style={[styles.title, { color: theme.dailyInk }]}>Ma collection</ThemedText>
        ) : <ThemedText type="smallBold">Couleurs validées</ThemedText>}
        <ThemedText
          accessibilityLabel={`${validatedColors.length} couleurs validées sur ${offeredCount} proposées depuis ton inscription`}
          type="smallBold"
          style={[styles.count, { color: theme.dailyInk }]}>
          {validatedColors.length} / {offeredCount}
        </ThemedText>
      </View>
      {preview ? (
        <ScrollView
          horizontal
          decelerationRate="fast"
          snapToInterval={tileWidth + tileGap}
          showsHorizontalScrollIndicator={false}
          accessibilityLabel={colors.length ? 'Aperçu des couleurs validées' : 'Emplacements de la collection'}
          contentContainerStyle={styles.rail}>
          {colors.length ? tiles : emptyTiles.map(key => (
            <View
              key={key}
              aria-hidden
              style={[styles.emptyTile, { backgroundColor: theme.dailySurface, borderColor: theme.dailyBorder }]}>
              <Image aria-hidden source={lock} style={styles.lock} tintColor={theme.dailyMuted} contentFit="contain" />
            </View>
          ))}
        </ScrollView>
      ) : (
        <>
          <ThemedText type="small" themeColor="textSecondary" style={styles.note}>
            Couleurs validées sur les défis proposés depuis ton inscription.
          </ThemedText>
          {colors.length > 0 ? <View style={styles.grid}>{tiles}</View> : (
            <ThemedText type="small" themeColor="textSecondary">Tes couleurs validées apparaîtront ici.</ThemedText>
          )}
        </>
      )}
    </View>
  );
}
