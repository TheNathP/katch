import { StyleSheet } from 'react-native';

import { OnboardingColors, Spacing } from '@/styles/theme';

export const styles = StyleSheet.create({
  wallet: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.half,
    paddingLeft: Spacing.half, paddingRight: 10,
    minHeight: 32, borderRadius: 16, backgroundColor: OnboardingColors.avatarAmber,
  },
  icon: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  value: { color: OnboardingColors.ink, fontVariant: ['tabular-nums'], fontWeight: '900' },
});
