import { StyleSheet } from 'react-native';

import { Spacing } from '@/styles/theme';

export const styles = StyleSheet.create({
  layout: { gap: 14 },
  weekPanel: { borderRadius: 20, paddingHorizontal: Spacing.three, paddingVertical: 12, gap: 10 },
  weekHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  weekTitle: { flex: 1, fontSize: 21, lineHeight: 25, fontWeight: '900', letterSpacing: -0.45 },
  week: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { flex: 1, minWidth: 0, alignItems: 'center', gap: Spacing.one },
  dayLabel: { textAlign: 'center', fontSize: 12 },
  mark: { borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 5, height: 5, borderRadius: 3, opacity: 0.45 },
  recordPanel: { borderRadius: 20, padding: Spacing.three },
  record: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  recordLabel: { flex: 1, minWidth: 0 },
  recordValue: { fontVariant: ['tabular-nums'] },
});
