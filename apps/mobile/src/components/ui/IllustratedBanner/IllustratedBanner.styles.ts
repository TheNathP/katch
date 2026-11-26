import { StyleSheet } from 'react-native';

import { Spacing } from '@/styles/theme';

export const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row', alignItems: 'center', minHeight: 174,
    marginHorizontal: -Spacing.three, marginTop: -Spacing.three, marginBottom: -Spacing.one,
    paddingHorizontal: Spacing.three, paddingBottom: Spacing.one, gap: Spacing.half,
  },
  accent: { ...StyleSheet.absoluteFill },
  accentDark: { opacity: 0.56 },
  art: { width: '45%', maxWidth: 185, height: 157, alignItems: 'center', justifyContent: 'center' },
  artIcon: { maxWidth: '100%' },
  image: { width: '100%', height: '100%' },
  copy: { flex: 1, alignItems: 'center', gap: Spacing.one, paddingTop: 24 },
  title: { textAlign: 'center', fontSize: 25, lineHeight: 29, fontWeight: '900', letterSpacing: -0.55 },
  detail: { maxWidth: 240, textAlign: 'center', fontSize: 13, lineHeight: 18, fontWeight: '600' },
});
