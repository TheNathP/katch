import { StyleSheet } from 'react-native';

import { Spacing } from '@/styles/theme';

export const styles = StyleSheet.create({
  stage: { height: 164, borderRadius: 18, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  mascot: { width: 144, height: 134 },
  copy: { alignItems: 'center', gap: Spacing.one },
  title: { textAlign: 'center', fontSize: 27, lineHeight: 32, fontWeight: '900', letterSpacing: -0.7 },
  item: { textAlign: 'center' },
  price: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
  action: { marginTop: Spacing.one },
  error: { textAlign: 'center' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: Spacing.two, marginTop: Spacing.one },
  cancel: { flex: 1, minWidth: 96 },
  confirm: { flex: 1, minWidth: 96 },
});
