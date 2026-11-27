import { StyleSheet } from 'react-native';

import { dailySwatchRadius, Fonts, Spacing } from '@/styles/theme';

const swatchHeight = 168;

export const styles = StyleSheet.create({
  card: {
    marginTop: -Spacing.two,
    borderRadius: 26,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  eyebrowText: { fontSize: 14, fontWeight: '800' },
  colorArea: { marginTop: Spacing.one, gap: Spacing.two },
  colorPlaceholder: {
    minHeight: swatchHeight + 26,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderRadius: dailySwatchRadius,
    padding: Spacing.three,
  },
  loading: { gap: Spacing.two },
  swatchPlaceholder: { height: swatchHeight, borderRadius: dailySwatchRadius },
  countdownPlaceholder: { alignSelf: 'flex-end', width: 96, height: 18, borderRadius: 9 },
  swatch: {
    height: swatchHeight,
    borderRadius: dailySwatchRadius,
    borderWidth: 1,
    overflow: 'hidden',
  },
  colorDetails: {
    minHeight: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: Spacing.two,
    rowGap: Spacing.one,
  },
  countdownOnly: { justifyContent: 'flex-end' },
  hex: { fontSize: 13, lineHeight: 18, fontFamily: Fonts.mono, fontWeight: '600' },
  stateText: { fontSize: 14, fontWeight: '600', flexShrink: 1 },
  error: { paddingHorizontal: Spacing.one, flex: 1 },
  retry: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' },
  retryText: { fontSize: 14, fontWeight: '800' },
  capture: { marginTop: Spacing.one },
});
