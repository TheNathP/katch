import { StyleSheet } from 'react-native';

import { Spacing } from '@/styles/theme';

export const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: Spacing.four,
  },
  content: {
    width: '100%',
    maxWidth: 480 + 2 * Spacing.three,
    paddingHorizontal: Spacing.three,
  },
});
