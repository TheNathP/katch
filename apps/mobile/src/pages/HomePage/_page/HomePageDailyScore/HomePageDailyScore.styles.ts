import { StyleSheet } from 'react-native';

import { Spacing } from '@/styles/theme';

const swatchSize = 44;

export const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderRadius: 18,
    paddingVertical: Spacing.two + Spacing.one,
    paddingHorizontal: Spacing.three,
  },
  swatch: {
    width: swatchSize,
    height: swatchSize,
    borderRadius: swatchSize / 2,
    borderWidth: 1,
  },
  text: { flex: 1, gap: Spacing.half },
  label: { fontSize: 13, fontWeight: '700' },
  title: { fontSize: 17, fontWeight: '900' },
  score: {
    maxWidth: '45%',
    flexShrink: 1,
    fontSize: 29,
    fontWeight: '900',
    letterSpacing: -1,
    fontVariant: ['tabular-nums'],
  },
});
