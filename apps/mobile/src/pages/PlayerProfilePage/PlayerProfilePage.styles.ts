import { StyleSheet } from 'react-native';

import { OnboardingColors, Spacing } from '@/styles/theme';

export const styles = StyleSheet.create({
  card: {
    minHeight: 224, padding: Spacing.three, gap: Spacing.two, alignItems: 'center', justifyContent: 'center',
    backgroundColor: OnboardingColors.lavender, borderColor: OnboardingColors.track,
    borderWidth: 1, borderRadius: 28, overflow: 'hidden',
  },
  corner: { position: 'absolute', right: -33, top: -29, width: 166, height: 119, opacity: 0.65 },
  medallion: {
    width: 105, height: 105, padding: Spacing.one, borderRadius: 53, borderWidth: 4,
    borderColor: OnboardingColors.card,
  },
  avatar: { width: '100%', height: '100%' },
  name: {
    maxWidth: '100%', textAlign: 'center', fontSize: 29, lineHeight: 33,
    fontWeight: '900', letterSpacing: -0.7, color: OnboardingColors.ink,
  },
  statusSlot: { minHeight: 28, justifyContent: 'center' },
  status: {
    paddingVertical: 4, paddingHorizontal: 11, borderRadius: 99,
    backgroundColor: OnboardingColors.card,
  },
  friendStatus: { backgroundColor: OnboardingColors.lime },
  statusLabel: { color: OnboardingColors.ink },
  resultGrid: { flexDirection: 'row', flexWrap: 'wrap', columnGap: '3%', rowGap: Spacing.two },
  result: {
    minHeight: 56, padding: Spacing.three, gap: Spacing.two, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center', borderRadius: 18, borderWidth: 1,
  },
  resultCopy: { flex: 1, minWidth: 0, gap: Spacing.one },
  lockFrame: {
    width: 38, height: 38, borderRadius: 13, backgroundColor: OnboardingColors.lavender,
    alignItems: 'center', justifyContent: 'center',
  },
  lockIcon: { width: 21, height: 21 },
});
