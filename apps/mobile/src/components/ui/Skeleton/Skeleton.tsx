import type { PropsWithChildren } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

import { styles } from './Skeleton.styles';

export default function Skeleton({ label, style, children }: PropsWithChildren<{
  label: string;
  style?: StyleProp<ViewStyle>;
}>) {
  return (
    <View accessible accessibilityRole="progressbar" accessibilityLabel={label}
      accessibilityState={{ busy: true }} style={style}>
      <View aria-hidden importantForAccessibility="no-hide-descendants">{children}</View>
    </View>
  );
}

export function SkeletonBlock({ style, tone = 'surface' }: {
  style?: StyleProp<ViewStyle>;
  tone?: 'surface' | 'contrast';
}) {
  const theme = useTheme();
  const backgroundColor = tone === 'contrast' ? theme.backgroundSelected : theme.dailySurface;

  return <View aria-hidden style={[styles.block, { backgroundColor }, style]} />;
}
