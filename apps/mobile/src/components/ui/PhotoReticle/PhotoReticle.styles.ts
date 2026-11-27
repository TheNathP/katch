import { StyleSheet } from 'react-native';

import { CaptureColors } from '@/styles/theme';

export const photoReticleSize = 66;

export const styles = StyleSheet.create({
  root: {
    width: photoReticleSize,
    height: photoReticleSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  corner: { position: 'absolute', width: 17, height: 17, borderWidth: 3 },
  topLeft: { top: 0, left: 0, borderBottomWidth: 0, borderRightWidth: 0, borderTopLeftRadius: 9 },
  topRight: { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0, borderTopRightRadius: 9 },
  bottomLeft: { bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0, borderBottomLeftRadius: 9 },
  bottomRight: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0, borderBottomRightRadius: 9 },
  sample: {
    width: 23, height: 23, borderRadius: 12, borderWidth: 2,
    borderColor: CaptureColors.foreground,
  },
});
