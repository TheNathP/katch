import { StyleSheet } from 'react-native';

import { Spacing } from '@/styles/theme';

export const styles = StyleSheet.create({
  row: { marginTop: 12, flexDirection: 'row', gap: Spacing.two },
  shortcut: {
    flex: 1,
    minHeight: 72,
    borderWidth: 1,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: Spacing.two,
    gap: 5,
  },
  icon: { width: 32, height: 32 },
  label: { flex: 1, fontSize: 13, fontWeight: '800' },
  chevron: { width: 14, height: 14 },
});
