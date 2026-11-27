import { StyleSheet } from 'react-native';

import { OnboardingColors, Spacing } from '@/styles/theme';

export const styles = StyleSheet.create({
  viewport: { flex: 1 },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: OnboardingColors.ink, opacity: 0.49 },
  backdrop: { ...StyleSheet.absoluteFill },
  placement: { flexGrow: 1, alignItems: 'center' },
  center: { justifyContent: 'center', padding: Spacing.three },
  bottom: { justifyContent: 'flex-end' },
  panel: { width: '100%', borderWidth: 1 },
  card: { maxWidth: 324, borderRadius: 26, padding: Spacing.three, gap: Spacing.two, boxShadow: OnboardingColors.cardShadow },
  sheet: { maxWidth: 520, borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 18, gap: 14 },
});
