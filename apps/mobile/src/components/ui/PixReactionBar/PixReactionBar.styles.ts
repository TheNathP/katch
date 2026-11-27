import { StyleSheet } from 'react-native';

import { Spacing } from '@/styles/theme';

export const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: Spacing.one },
  palette: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center',
    gap: Spacing.one, padding: Spacing.one, maxWidth: '100%', borderRadius: 28, borderWidth: 1,
  },
  option: {
    width: 50, minHeight: 50, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'transparent', borderRadius: 25,
  },
  pix: { width: 40, height: 40 },
  count: {
    position: 'absolute', right: 0, bottom: 0, minWidth: 16, paddingHorizontal: 3,
    borderRadius: 8, overflow: 'hidden', textAlign: 'center',
    fontSize: 10, lineHeight: 14, fontWeight: '800', fontVariant: ['tabular-nums'],
  },
  pressed: { opacity: 0.72 },
});
