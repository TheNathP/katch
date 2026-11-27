import { View } from 'react-native';

import ChallengePhoto from '@/components/ui/ChallengePhoto';
import NavigationLink from '@/components/ui/NavigationLink';
import ThemedText from '@/components/ui/ThemedText';
import type { ChallengeResult } from '@/data/adapters/challenge-history.adapters';
import { useTheme } from '@/hooks/use-theme';
import { formatChallengeDay, formatChallengeScore, formatCompactChallengeDay } from '@/lib/challenge-calendar';

import { styles } from './ChallengeHistoryCard.styles';

export default function ChallengeHistoryCard({ entry }: { entry: ChallengeResult }) {
  const theme = useTheme();
  const score = formatChallengeScore(entry.score);
  return (
    <NavigationLink
      href={{ pathname: '/historique/[date]', params: { date: entry.date } }}
      label={formatChallengeDay(entry.date) + ', ' + score + ', voir le résultat'}
      variant="plain"
      style={[
        styles.card,
        { backgroundColor: theme.dailyCard, borderColor: theme.dailyBorder },
      ]}>
      <View aria-hidden style={[styles.colorBand, { backgroundColor: entry.targetHex ?? theme.dailySurface }]} />
      <ChallengePhoto photo={entry.photo} hex={entry.targetHex} style={styles.photo} />
      <View aria-hidden style={styles.caption}>
        <ThemedText type="smallBold" themeColor="dailyInk" style={styles.date}>{formatCompactChallengeDay(entry.date)}</ThemedText>
        <ThemedText style={[
          styles.score,
          { color: theme.dailyAccent, backgroundColor: theme.dailySurface },
          entry.collected && styles.collected,
        ]}>
          {score}
        </ThemedText>
      </View>
    </NavigationLink>
  );
}
