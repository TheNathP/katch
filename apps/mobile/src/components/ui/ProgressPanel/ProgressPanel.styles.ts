import { StyleSheet } from 'react-native';

import { Spacing } from '@/styles/theme';

export const styles = StyleSheet.create({
  card: { padding: Spacing.three, borderRadius: 20, gap: 12 },
  header: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  heading: { flex: 1, minWidth: 138, flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  copy: { flex: 1, minWidth: 0 },
  footer: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.two },
  value: { fontVariant: ['tabular-nums'] },
});
