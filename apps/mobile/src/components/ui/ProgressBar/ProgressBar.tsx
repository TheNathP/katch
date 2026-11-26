import { View } from 'react-native';
import Animated, { type SharedValue, useAnimatedStyle } from 'react-native-reanimated';

import { useTheme } from '@/hooks/use-theme';
import { Colors, OnboardingColors, ProgressBarTokens } from '@/styles/theme';

import { styles } from './ProgressBar.styles';

type Props = {
  value: number;
  max: number;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  tone?: 'primary' | 'rejected';
  surface?: 'theme' | 'light';
  animatedValue?: SharedValue<number>;
};

export default function ProgressBar({
  value,
  max,
  label,
  size = 'medium',
  tone = 'primary',
  surface = 'theme',
  animatedValue,
}: Props) {
  const theme = useTheme();
  const validRange = Number.isFinite(max) && max > 0;
  const current = validRange && Number.isFinite(value) ? Math.min(max, Math.max(0, value)) : 0;
  const fillWidth = useAnimatedStyle(() => {
    const displayed = animatedValue?.get() ?? current;
    const ratio = validRange && Number.isFinite(displayed) ? Math.max(0, Math.min(1, displayed / max)) : 0;
    return { width: `${ratio * 100}%` };
  });
  const trackColors = surface === 'light' || theme === Colors.light
    ? { backgroundColor: OnboardingColors.lavender, borderColor: OnboardingColors.track }
    : { backgroundColor: theme.dailySurface, borderColor: theme.dailyBorder };

  return (
    <View
      accessible={Boolean(label)}
      aria-hidden={!label}
      accessibilityRole={label ? 'progressbar' : undefined}
      accessibilityLabel={label}
      aria-valuemin={label ? 0 : undefined}
      aria-valuemax={label ? (validRange ? max : 100) : undefined}
      aria-valuenow={label ? current : undefined}
      style={[styles.track, styles[size], trackColors]}>
      <Animated.View style={[styles.fill, ProgressBarTokens[tone], fillWidth]} />
    </View>
  );
}
