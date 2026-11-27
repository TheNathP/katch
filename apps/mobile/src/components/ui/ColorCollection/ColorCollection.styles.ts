import { StyleSheet } from 'react-native';

import { ComicFeedbackColors, OnboardingColors, Spacing } from '@/styles/theme';

export const tileWidth = 94;
export const tileGap = Spacing.two;

export const styles = StyleSheet.create({
  section: { gap: 10 },
  header: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  title: { fontWeight: '900', fontSize: 20, lineHeight: 24, letterSpacing: -0.45 },
  count: { fontVariant: ['tabular-nums'], fontWeight: '900' },
  rail: { gap: tileGap, paddingVertical: Spacing.one },
  tile: { width: tileWidth, paddingHorizontal: Spacing.one, paddingVertical: Spacing.one, gap: 3, borderRadius: 16, borderWidth: 1, alignItems: 'stretch', alignSelf: 'stretch' },
  gridTile: { width: '32%' },
  swatch: { height: 58, borderRadius: 12, borderWidth: 1 },
  fullSwatch: { height: 80, padding: 5, justifyContent: 'flex-end', alignItems: 'flex-start' },
  hex: { textAlign: 'center', fontSize: 12, lineHeight: 17 },
  date: { textAlign: 'center', fontSize: 11, lineHeight: 14, paddingBottom: Spacing.one },
  score: {
    color: OnboardingColors.white, backgroundColor: ComicFeedbackColors.ink, borderRadius: 8,
    overflow: 'hidden', fontWeight: '900', fontSize: 11, lineHeight: 15, paddingHorizontal: 5, paddingVertical: 1,
  },
  emptyTile: { width: tileWidth, height: 75, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  lock: { width: 18, height: 18, opacity: 0.7 },
});
