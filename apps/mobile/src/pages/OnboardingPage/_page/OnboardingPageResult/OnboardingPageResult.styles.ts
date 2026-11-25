import { StyleSheet } from 'react-native';

import { OnboardingColors as color, Spacing } from '@/styles/theme';

export const styles = StyleSheet.create({
  result: { gap: 12 },
  title: {
    textAlign: 'center',
    color: color.ink,
    fontSize: 34,
    lineHeight: 39,
    fontWeight: '900',
    letterSpacing: -1.25,
  },
  card: {
    backgroundColor: color.card,
    borderColor: color.track,
    borderWidth: 1,
    borderRadius: 22,
    gap: 11,
    padding: Spacing.three,
    boxShadow: color.cardShadow,
  },
  scoreTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  scoreText: { flex: 1 },
  scoreLabel: { color: color.muted, fontSize: 14, fontWeight: '700' },
  score: {
    color: color.purple,
    fontSize: 42,
    fontVariant: ['tabular-nums'],
    fontWeight: '900',
    letterSpacing: -1,
  },
  rejectedScore: { color: color.feedbackRejected },
  scoreUnit: { color: color.ink, fontSize: 14, fontWeight: '800', letterSpacing: 0 },
  thumbnail: { width: 48, height: 48, borderRadius: 12 },
  track: {
    height: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: color.track,
    padding: 1,
    backgroundColor: color.lavender,
    boxShadow: color.scoreTrackShadow,
  },
  fill: {
    height: '100%',
    borderRadius: 8,
    backgroundColor: color.purple,
    backgroundImage: color.scoreFillGradient,
    boxShadow: color.scoreFillShadow,
  },
  rejectedFill: {
    backgroundColor: color.feedbackRejected,
    backgroundImage: color.rejectedScoreGradient,
    boxShadow: color.rejectedScoreShadow,
  },
});
