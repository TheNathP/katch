import { StyleSheet } from 'react-native';

import { CaptureColors, Spacing } from '@/styles/theme';

export const styles = StyleSheet.create({
  layer: { ...StyleSheet.absoluteFill },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: CaptureColors.scrim, opacity: 0.24 },
  finder: { position: 'absolute', top: 0, left: 0 },
  miss: {
    position: 'absolute', right: -11, top: -11, width: 25, height: 25, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  statusRow: { position: 'absolute', bottom: Spacing.two, left: Spacing.one, right: Spacing.one, alignItems: 'center' },
  status: {
    borderRadius: 16, overflow: 'hidden', textAlign: 'center', paddingHorizontal: Spacing.two,
    paddingVertical: 6, fontSize: 14, lineHeight: 19, fontWeight: '700',
  },
});
