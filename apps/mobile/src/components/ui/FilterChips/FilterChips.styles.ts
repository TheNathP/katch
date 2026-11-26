import { StyleSheet } from 'react-native';

import { OnboardingColors, Spacing } from '@/styles/theme';

export const styles = StyleSheet.create({
  content: { flexGrow: 1, gap: Spacing.one },
  chip: {
    flexGrow: 1, minHeight: 44, paddingHorizontal: 10, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  selected: { backgroundColor: OnboardingColors.lime },
  pressed: { opacity: 0.74 },
  label: { fontSize: 14, lineHeight: 19, fontWeight: '900', textAlign: 'center' },
  selectedLabel: { color: OnboardingColors.ink },
});
