import { Text, View } from 'react-native';

import type { DailySubmission } from '@/data/adapters/daily-color.adapters';
import { useTheme } from '@/hooks/use-theme';
import { scoreFeedback } from '@/lib/score-feedback';

import { styles } from './HomePageDailyScore.styles';

type Props = { submission: DailySubmission };

/** The score of the player's photo of the day, as returned by the server. */
export default function HomePageDailyScore({ submission }: Props) {
  const theme = useTheme();
  const { score, matchedHex } = submission;
  const feedback = scoreFeedback(score);

  return (
    <View
      accessible
      accessibilityLabel={`Ton score du jour : ${score} sur 100. ${feedback.title}`}
      style={[styles.root, { backgroundColor: theme.dailySurface }]}>
      <View style={[styles.swatch, { backgroundColor: matchedHex, borderColor: theme.dailySwatchBorder }]} />
      <View style={styles.text}>
        <Text style={[styles.label, { color: theme.dailyMuted }]}>Ton score du jour</Text>
        <Text numberOfLines={1} style={[styles.title, { color: theme.dailyInk }]}>{feedback.title}</Text>
      </View>
      <Text style={[styles.score, { color: theme.dailyAccent }]}>
        {score}
        <Text style={styles.total}>/100</Text>
      </Text>
    </View>
  );
}
