import { StyleSheet } from 'react-native';

import { OnboardingColors, Spacing } from '@/styles/theme';

export const styles = StyleSheet.create({
  viewport: { flex: 1 },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: OnboardingColors.ink },
  placement: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.three },
  backdropTarget: { ...StyleSheet.absoluteFill },
  panel: {
    width: '100%',
    maxWidth: 324,
    borderWidth: 1,
    borderRadius: 26,
    padding: Spacing.three,
    gap: Spacing.two,
    boxShadow: OnboardingColors.cardShadow,
  },
  stage: { height: 164, borderRadius: 18, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  mascot: { width: 144, height: 134 },
  copy: { alignItems: 'center', gap: Spacing.one },
  title: { textAlign: 'center', fontSize: 27, lineHeight: 32, fontWeight: '900', letterSpacing: -0.7 },
  item: { textAlign: 'center' },
  price: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  action: { marginTop: Spacing.one },
  error: { textAlign: 'center' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: Spacing.two, marginTop: Spacing.one },
  cancel: { flex: 1, minHeight: 44, minWidth: 96, alignItems: 'center', justifyContent: 'center' },
  confirm: { flex: 1, minWidth: 96 },
});
