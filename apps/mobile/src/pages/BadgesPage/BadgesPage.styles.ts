import { StyleSheet } from 'react-native';

import { Spacing } from '@/styles/theme';

export const styles = StyleSheet.create({
  collection: { gap: Spacing.two },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  badge: { width: '48.5%', borderRadius: 20 },
  medal: { minHeight: 84, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  locked: { opacity: 0.7 },
  stamp: { position: 'absolute', right: 8, bottom: 8, width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, padding: 10, gap: Spacing.one },
  title: { textAlign: 'center', fontSize: 14, lineHeight: 19, fontWeight: '900' },
  description: { textAlign: 'center', fontSize: 12, lineHeight: 16 },
  claim: { minHeight: 44, paddingHorizontal: 6 },
  coins: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  state: { textAlign: 'center', fontSize: 12, lineHeight: 16 },
  progress: { marginTop: 'auto', paddingTop: Spacing.one, gap: Spacing.one, minHeight: 34, justifyContent: 'flex-end' },
  empty: { textAlign: 'center', paddingVertical: Spacing.three },
});
