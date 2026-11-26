import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import type { LeaderboardEntry } from '@/data/adapters/leaderboard.adapters';
import { useTheme } from '@/hooks/use-theme';

import { styles } from './LeaderboardPageRow.styles';

const crown = require('@/assets/icon-illus/crown.png');

export default function LeaderboardPageRow({ entry, onPress }: { entry: LeaderboardEntry; onPress: () => void }) {
  const theme = useTheme();
  const { name, rank, scoreLabel, isCurrentPlayer } = entry;
  const first = rank === 1;
  const initial = Array.from(name.trim())[0]?.toLocaleUpperCase('fr-FR');
  const placement = rank === null ? 'Sans score' : `Rang ${rank}`;
  const scoreColor = first ? theme.leaderboardFirstInk : theme.dailyAccent;
  const backgroundColor = first ? theme.leaderboardFirstSurface : isCurrentPlayer ? theme.dailySurface : theme.dailyCard;
  const borderColor = first ? theme.leaderboardFirstBorder : isCurrentPlayer ? theme.dailyAccent : theme.dailyBorder;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={[placement, name, isCurrentPlayer && 'Moi', scoreLabel].filter(Boolean).join(', ')}
      accessibilityHint="Ouvre le profil du joueur"
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor, borderColor },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.rank}>
        {first ? (
          <Image aria-hidden source={crown} style={styles.crown} contentFit="contain" />
        ) : (
          <Text style={[styles.rankText, { color: theme.dailyMuted }]}>{rank ?? '–'}</Text>
        )}
      </View>
      <View style={[styles.avatar, { backgroundColor: first || isCurrentPlayer ? theme.dailyCard : theme.dailySurface }]}>
        <Text aria-hidden style={[styles.initial, { color: scoreColor }]}>{initial}</Text>
      </View>
      <View style={styles.player}>
        <Text numberOfLines={1} style={[styles.name, { color: theme.dailyInk }]}>{name}</Text>
        {isCurrentPlayer && <Text style={styles.ownLabel}>Moi</Text>}
      </View>
      <Text style={[styles.score, { color: scoreLabel ? scoreColor : theme.dailyMuted }]}>
        {scoreLabel ?? 'Sans score'}
      </Text>
    </Pressable>
  );
}
