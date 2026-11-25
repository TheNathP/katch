import { StyleSheet } from 'react-native';

import { Spacing } from '@/styles/theme';

export const styles = StyleSheet.create({
  field: {
    gap: Spacing.one,
  },
  input: {
    minHeight: 48,
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
});
