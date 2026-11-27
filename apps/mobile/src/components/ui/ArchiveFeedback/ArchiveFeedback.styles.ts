import { StyleSheet } from 'react-native';

import { Spacing } from '@/styles/theme';

export const styles = StyleSheet.create({
  card: {
    minHeight: 144, borderWidth: 1, borderRadius: 23, padding: Spacing.three,
    gap: Spacing.two, alignItems: 'center', justifyContent: 'center',
  },
  pix: { width: 60, height: 60 },
  center: { textAlign: 'center' },
  line: { width: '42%', height: 20, borderRadius: 10, alignSelf: 'flex-start' },
  block: { width: '100%', height: 112, borderRadius: 16 },
});
