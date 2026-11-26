import { StyleSheet } from 'react-native';

import { Spacing } from '@/styles/theme';

export const tileWidth = 94;
export const tileGap = Spacing.two;

export const styles = StyleSheet.create({
  section: { gap: 10 },
  header: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  title: { fontWeight: '900', fontSize: 20, lineHeight: 24, letterSpacing: -0.45 },
  count: { fontVariant: ['tabular-nums'], fontWeight: '900' },
  rail: { gap: tileGap, paddingVertical: Spacing.one },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: tileGap },
  tile: { width: tileWidth, padding: Spacing.one, gap: 3, borderRadius: 16, borderWidth: 1 },
  gridTile: { flexBasis: '30%', flexGrow: 1, maxWidth: '32%', minWidth: 80 },
  swatch: { height: 58, borderRadius: 12 },
  hex: { textAlign: 'center', fontSize: 12, lineHeight: 17 },
  emptyTile: { width: tileWidth, height: 75, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  lock: { width: 18, height: 18, opacity: 0.7 },
  note: { fontSize: 13, lineHeight: 18 },
});
