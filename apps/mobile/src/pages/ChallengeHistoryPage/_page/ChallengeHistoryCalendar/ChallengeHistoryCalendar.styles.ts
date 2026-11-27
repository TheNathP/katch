import { StyleSheet } from 'react-native';

import { Spacing } from '@/styles/theme';

export const styles = StyleSheet.create({
  calendar: { gap: 4 },
  week: { flexDirection: 'row', gap: 4 },
  weekday: { flex: 1, textAlign: 'center', fontSize: 10, paddingVertical: Spacing.one },
  space: { flex: 1 },
  cell: {
    flex: 1, minWidth: 0, minHeight: 46, borderRadius: 9, overflow: 'hidden',
    justifyContent: 'space-between', alignItems: 'center', paddingVertical: 3, borderWidth: 1,
  },
  today: { borderWidth: 2, paddingVertical: 2 },
  thumbnail: { ...StyleSheet.absoluteFill },
  tint: { ...StyleSheet.absoluteFill, opacity: 0.8 },
  number: { fontWeight: '800', fontSize: 12, lineHeight: 16 },
  score: {
    width: '100%', fontWeight: '900', fontSize: 9, lineHeight: 14, borderRadius: 8,
    overflow: 'hidden', textAlign: 'center', paddingHorizontal: 1,
    fontVariant: ['tabular-nums'],
  },
  future: { opacity: 0.45 },
  pressed: { opacity: 0.72 },
});
