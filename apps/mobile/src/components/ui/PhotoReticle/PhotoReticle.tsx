import type { PropsWithChildren } from 'react';
import { View } from 'react-native';

import { CaptureColors } from '@/styles/theme';

import { styles } from './PhotoReticle.styles';

const corners = [styles.topLeft, styles.topRight, styles.bottomLeft, styles.bottomRight];

export default function PhotoReticle({ color, children }: PropsWithChildren<{ color?: string }>) {
  const borderColor = color ? CaptureColors.accent : CaptureColors.foreground;

  return (
    <View aria-hidden pointerEvents="none" style={styles.root}>
      {corners.map((corner, index) => <View key={index} style={[styles.corner, corner, { borderColor }]} />)}
      {color && <View style={[styles.sample, { backgroundColor: color }]} />}
      {children}
    </View>
  );
}
