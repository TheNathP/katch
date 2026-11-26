import { StyleSheet } from 'react-native';

import { OnboardingColors, Spacing } from '@/styles/theme';

export const styles = StyleSheet.create({
  layout: { gap: Spacing.three, paddingBottom: Spacing.four },
  result: { padding: Spacing.three, borderRadius: 24, borderWidth: 1, gap: Spacing.two },
  resultRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: Spacing.two, justifyContent: 'space-between' },
  score: { fontSize: 43, lineHeight: 52, fontWeight: '900', letterSpacing: -1.2, fontVariant: ['tabular-nums'] },
  target: { flexDirection: 'row', alignItems: 'center', flexShrink: 1, gap: Spacing.two, padding: Spacing.two, borderWidth: 1, borderRadius: 14 },
  swatch: { width: 30, height: 30, borderRadius: 8, borderWidth: 1 },
  photo: { width: '100%', aspectRatio: 0.9, maxHeight: 520, borderRadius: 24 },
  collection: { alignSelf: 'stretch', padding: Spacing.three, borderRadius: 15, backgroundColor: OnboardingColors.lime },
  collectionText: { color: OnboardingColors.ink, textAlign: 'center' },
});
