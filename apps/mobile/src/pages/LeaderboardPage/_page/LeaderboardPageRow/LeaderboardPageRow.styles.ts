import { StyleSheet } from 'react-native';

import { Spacing } from '@/styles/theme';

export const styles = StyleSheet.create({
  row: {
    borderWidth: 1, borderRadius: 20, minHeight: 64,
    paddingVertical: Spacing.two, paddingHorizontal: 12, gap: Spacing.two,
    flexDirection: 'row', alignItems: 'center',
  },
  pressed: { opacity: 0.75 },
  rank: { minWidth: 34, alignItems: 'center' },
  rankText: { fontSize: 13, fontWeight: '800', fontVariant: ['tabular-nums'] },
  crown: { width: 34, height: 30 },
  name: { flex: 1, minWidth: 0, fontSize: 15, fontWeight: '800' },
  score: { fontSize: 15, fontWeight: '900', fontVariant: ['tabular-nums'], textAlign: 'right' },
});
