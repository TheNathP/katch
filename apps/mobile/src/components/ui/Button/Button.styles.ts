import { StyleSheet } from 'react-native';

import { Spacing } from '@/styles/theme';

export const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  disabled: {
    opacity: 0.6,
  },
});
