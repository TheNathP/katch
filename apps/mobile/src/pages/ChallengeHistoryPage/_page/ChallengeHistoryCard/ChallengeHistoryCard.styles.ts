import { StyleSheet } from 'react-native';

import { OnboardingColors, Spacing } from '@/styles/theme';

export const styles = StyleSheet.create({
  card: {
    flexBasis: '47%', flexGrow: 1, maxWidth: '49%', borderRadius: 18, borderWidth: 1,
    paddingHorizontal: Spacing.two, paddingVertical: Spacing.two, gap: Spacing.one,
    alignItems: 'stretch', alignSelf: 'stretch',
  },
  colorBand: { height: 5, borderRadius: 3, marginBottom: 1 },
  photo: { width: '100%', aspectRatio: 1, borderRadius: 12 },
  caption: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: Spacing.two, padding: Spacing.one },
  date: { flexGrow: 1 },
  score: {
    fontWeight: '900', fontSize: 13, lineHeight: 20, borderRadius: 14, overflow: 'hidden',
    fontVariant: ['tabular-nums'], paddingHorizontal: 6, paddingVertical: Spacing.one,
  },
  collected: { color: OnboardingColors.ink, backgroundColor: OnboardingColors.lime },
});
