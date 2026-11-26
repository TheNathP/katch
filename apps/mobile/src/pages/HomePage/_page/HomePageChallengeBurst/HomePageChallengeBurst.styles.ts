import { StyleSheet } from 'react-native';

import { DailyRevealColors } from '@/styles/theme';

export const burstSize = 96;

export const styles = StyleSheet.create({
  field: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    width: burstSize,
    height: burstSize,
  },
  disc: {
    ...StyleSheet.absoluteFill,
    borderRadius: burstSize / 2,
  },
  ring: {
    borderWidth: 1.5,
    borderColor: DailyRevealColors.question,
  },
  sparks: StyleSheet.absoluteFill,
  spark: {
    position: 'absolute',
    width: 3,
    borderRadius: 2,
    backgroundColor: DailyRevealColors.question,
  },
});
