import { StyleSheet } from 'react-native';

import { MaxContentWidth, Spacing } from '@/styles/theme';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.three,
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.two,
  },
});
