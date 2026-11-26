import { Image } from 'expo-image';
import { Pressable, Text, View } from 'react-native';

import Avatar from '@/components/ui/Avatar';
import type { AvatarCatalog } from '@/data/adapters/avatar-catalog.adapters';
import type { LeaderboardEntry } from '@/data/adapters/leaderboard.adapters';
import { useTheme } from '@/hooks/use-theme';

import { styles } from './LeaderboardPageRow.styles';

const crowns = [
  require('@/assets/icons/badges/rank-1.svg'),
  require('@/assets/icons/badges/rank-2.svg'),
  require('@/assets/icons/badges/rank-3.svg'),
];
const fallbackAvatar = require('@/assets/images/pix/happy.png');

type Props = { entry: LeaderboardEntry; catalog: AvatarCatalog | null; onPress: () => void };

export default function LeaderboardPageRow({ entry, catalog, onPress }: Props) {
  const theme = useTheme();
  const { name, rank, scoreLabel, isCurrentPlayer, avatarId, avatarBackgroundId } = entry;
  const first = rank === 1;
  const crown = rank === null ? undefined : crowns[rank - 1];
  const avatar = catalog?.avatars.find(({ id }) => id === avatarId);
  const avatarBackground = catalog?.backgrounds.find(({ id }) => id === avatarBackgroundId);
  const placement = rank === null ? 'Sans score' : `Rang ${rank}`;
  const scoreColor = first ? theme.leaderboardFirstInk : theme.dailyAccent;
  const backgroundColor = first ? theme.leaderboardFirstSurface : isCurrentPlayer ? theme.dailySurface : theme.dailyCard;
  const borderColor = first ? theme.leaderboardFirstBorder : isCurrentPlayer ? theme.dailyAccent : theme.dailyBorder;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={[placement, name, isCurrentPlayer && 'Ton profil', scoreLabel].filter(Boolean).join(', ')}
      accessibilityHint="Ouvre le profil du joueur"
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor, borderColor },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.rank}>
        {crown ? (
          <Image aria-hidden source={crown} style={styles.crown} contentFit="contain" />
        ) : (
          <Text style={[styles.rankText, { color: theme.dailyMuted }]}>{rank ?? '–'}</Text>
        )}
      </View>
      <Avatar
        size={36}
        imageUrl={avatar?.imageUrl}
        backgroundHex={avatarBackground?.hex ?? theme.dailySurface}
        fallbackSource={fallbackAvatar}
      />
      <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.name, { color: theme.dailyInk }]}>{name}</Text>
      <Text style={[styles.score, { color: scoreLabel ? scoreColor : theme.dailyMuted }]}>
        {scoreLabel ?? 'Sans score'}
      </Text>
    </Pressable>
  );
}
