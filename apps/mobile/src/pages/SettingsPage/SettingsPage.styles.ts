import { StyleSheet } from 'react-native';

import { Spacing } from '@/styles/theme';

export const styles = StyleSheet.create({
  headerTitle: { fontWeight: '900' },
  section: { gap: Spacing.two, marginBottom: Spacing.three },
  heading: { fontSize: 21, lineHeight: 26, fontWeight: '900', letterSpacing: -0.45 },
  card: { paddingHorizontal: 12, borderRadius: 20, borderWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 52, gap: 10 },
  divider: { borderTopWidth: StyleSheet.hairlineWidth },
  label: { flex: 1 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  pressed: { opacity: 0.65 },
  primary: { marginTop: Spacing.one },
  confirmation: { padding: 12, gap: Spacing.two, borderRadius: 16, borderWidth: 1 },
  dialogTitle: { fontSize: 22, lineHeight: 28, fontWeight: '900' },
  dialogActions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  dialogAction: { flex: 1, minWidth: 116, minHeight: 54, paddingVertical: Spacing.two, paddingHorizontal: 10 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end' },
});
