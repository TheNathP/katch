import { StyleSheet } from 'react-native';

import { DailyRevealColors, dailySwatchRadius } from '@/styles/theme';

export const styles = StyleSheet.create({
  overlay: { flex: 1 },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: DailyRevealColors.backdrop },
  foreground: {
    position: 'absolute',
    zIndex: 1,
    borderRadius: dailySwatchRadius,
    borderWidth: 1,
    borderColor: DailyRevealColors.rim,
    overflow: 'hidden',
  },
});
