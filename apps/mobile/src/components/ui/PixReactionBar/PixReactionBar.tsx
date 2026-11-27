import { Image } from 'expo-image';
import { Pressable, View } from 'react-native';

import ThemedText from '@/components/ui/ThemedText';
import { pixReactions, type PhotoReactions, type PixReaction } from '@/data/social-api.types';
import { useTheme } from '@/hooks/use-theme';

import { styles } from './PixReactionBar.styles';

export const pixReactionArt = {
  like: { label: 'J’aime', source: require('@/assets/images/pix/reactions/like.png') },
  love: { label: 'J’adore', source: require('@/assets/images/pix/reactions/love.png') },
  laugh: { label: 'Ça me fait rire', source: require('@/assets/images/pix/reactions/laugh.png') },
  wow: { label: 'Wow', source: require('@/assets/images/pix/reactions/wow.png') },
} satisfies Record<PixReaction, { label: string; source: number }>;

type Props = {
  value: PhotoReactions;
  onReact?: (reaction: PixReaction | null) => void;
  busy?: boolean;
  error?: string;
};

export default function PixReactionBar({ value, onReact, busy = false, error }: Props) {
  const theme = useTheme();
  const choices = onReact ? pixReactions : pixReactions.filter(reaction => (value.counts[reaction] ?? 0) > 0);
  if (!choices.length) return null;

  return (
    <View style={styles.container}>
      <View style={[styles.palette, {
        backgroundColor: theme.dailySurface, borderColor: theme.dailyBorder, boxShadow: theme.dailyShadow,
      }]}>
        {choices.map(reaction => {
          const { label, source } = pixReactionArt[reaction];
          const count = value.counts[reaction] ?? 0;
          const selected = value.myReaction === reaction;
          const accessibleLabel = count > 0 ? `${label}, ${count} ${count === 1 ? 'réaction' : 'réactions'}` : label;
          const content = (
            <>
              <Image aria-hidden source={source} style={styles.pix} contentFit="contain" enforceEarlyResizing />
              {count > 0 && (
                <ThemedText
                  aria-hidden
                  maxFontSizeMultiplier={1.4}
                  style={[styles.count, { color: theme.dailyInk, backgroundColor: theme.dailyCard }]}>
                  {count > 99 ? '99+' : count}
                </ThemedText>
              )}
            </>
          );
          return onReact ? (
            <Pressable
              key={reaction}
              accessibilityRole="button"
              accessibilityLabel={accessibleLabel}
              accessibilityHint={selected ? 'Retire ta réaction' : 'Réagit à la photo'}
              accessibilityState={{ selected, busy, disabled: busy }}
              disabled={busy}
              onPress={() => onReact(selected ? null : reaction)}
              style={({ pressed }) => [
                styles.option,
                selected && { backgroundColor: theme.backgroundSelected, borderColor: theme.dailyAccent },
                pressed && styles.pressed,
              ]}>
              {content}
            </Pressable>
          ) : (
            <View key={reaction} accessible accessibilityLabel={accessibleLabel} style={styles.option}>
              {content}
            </View>
          );
        })}
      </View>
      {error && <ThemedText type="small" themeColor="danger" accessibilityLiveRegion="polite">{error}</ThemedText>}
    </View>
  );
}
