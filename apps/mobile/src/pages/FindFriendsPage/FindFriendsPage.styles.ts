import { StyleSheet } from 'react-native';

import { OnboardingColors, Spacing } from '@/styles/theme';

export const styles = StyleSheet.create({
  searchCard: {
    padding: Spacing.three, gap: Spacing.two, borderRadius: 26, borderWidth: 1,
    borderColor: OnboardingColors.track, backgroundColor: OnboardingColors.lavender, overflow: 'hidden',
  },
  intro: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  title: { flex: 1, minWidth: 0, fontSize: 27, lineHeight: 30, fontWeight: '900', letterSpacing: -0.7, color: OnboardingColors.ink },
  corner: { position: 'absolute', top: -24, right: -31, width: 145, height: 110 },
  pix: { width: 83, height: 83 },
  searchField: {
    minHeight: 52, flexDirection: 'row', alignItems: 'center', borderRadius: 16,
    backgroundColor: OnboardingColors.white, borderWidth: 1, borderColor: OnboardingColors.track,
  },
  searchIcon: { paddingLeft: 13, paddingRight: 9 },
  input: { flex: 1, minWidth: 0, minHeight: 50, paddingVertical: 10, paddingRight: 10, fontSize: 16, color: OnboardingColors.ink },
  clearButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  closeIcon: { width: 17, height: 17 },
  noResults: {
    minHeight: 106, padding: Spacing.three, gap: Spacing.two, flexDirection: 'row',
    alignItems: 'center', borderWidth: 1, borderRadius: 19,
  },
  restingPix: { width: 62, height: 62 },
  noResultsCopy: { flex: 1, minWidth: 0, gap: Spacing.one },
});
