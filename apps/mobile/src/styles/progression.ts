import { StyleSheet } from 'react-native';

import { Spacing } from '@/styles/theme';

export const styles = StyleSheet.create({
  navTitle: { fontWeight: '900' },
  layout: { gap: 22, paddingBottom: Spacing.four },
  section: { gap: 10 },
  heading: { fontSize: 23, lineHeight: 30, fontWeight: '900', letterSpacing: -0.6 },
  loadingHero: { minHeight: 148, borderWidth: 1, borderRadius: 26, padding: 19, gap: Spacing.two, justifyContent: 'center' },
  loadingShort: { width: '30%', height: 15, borderRadius: 8 },
  loadingWide: { width: '55%', height: 28, borderRadius: 10 },
  loadingRow: { minHeight: 66, borderWidth: 1, borderRadius: 18 },
});
