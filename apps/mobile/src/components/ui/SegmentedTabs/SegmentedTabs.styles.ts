import { StyleSheet } from 'react-native';

import { ButtonTokens, OnboardingColors, Spacing } from '@/styles/theme';

export const styles = StyleSheet.create({
  track: { flexDirection: 'row', borderRadius: 24, padding: Spacing.one, gap: Spacing.one },
  tab: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 20, padding: Spacing.one },
  gradientTab: { borderRadius: 22, padding: Spacing.two },
  solidSelection: { backgroundColor: OnboardingColors.lime },
  gradientSelection: {
    backgroundColor: ButtonTokens.limeSolid.background,
    experimental_backgroundImage: ButtonTokens.limeSolid.gradient,
  },
  pressed: { opacity: 0.55 },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '700', textAlign: 'center' },
  gradientLabel: { fontSize: 15, fontWeight: '800', textAlign: 'center' },
});
