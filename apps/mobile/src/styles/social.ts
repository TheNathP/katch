import { StyleSheet } from 'react-native';

import { OnboardingColors, Spacing } from '@/styles/theme';

export const socialStyles = StyleSheet.create({
  layout: { gap: Spacing.three, paddingBottom: Spacing.four },
  section: { gap: Spacing.two },
  groupTitle: { fontSize: 23, lineHeight: 29, fontWeight: '800', letterSpacing: -0.45 },
  action: {
    minHeight: 44, minWidth: 44, borderRadius: 12, paddingHorizontal: Spacing.two,
    justifyContent: 'center', alignItems: 'center',
  },
  iconAction: { width: 44, height: 44, paddingHorizontal: 0, borderRadius: 22 },
  pressed: { opacity: 0.65 },
  disabled: { opacity: 0.45 },
  onLime: { color: OnboardingColors.ink },
  empty: { padding: Spacing.three, borderRadius: 18, gap: Spacing.one },
  input: {
    minHeight: 52, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two,
    borderRadius: 14, borderWidth: 1, fontSize: 16,
  },
});
