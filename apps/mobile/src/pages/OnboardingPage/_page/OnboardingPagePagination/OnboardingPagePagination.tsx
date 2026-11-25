import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { OnboardingColors as color } from '@/styles/theme';

import { styles } from './OnboardingPagePagination.styles';

type DotProps = {
  active: boolean;
  disabled: boolean;
  label: string;
  reduceMotion: boolean;
  onPress: () => void;
};

function PaginationDot({ active, disabled, label, reduceMotion, onPress }: DotProps) {
  const emphasis = useSharedValue(active ? 1 : 0);

  useEffect(() => {
    const next = active ? 1 : 0;
    emphasis.set(reduceMotion ? next : withTiming(next, {
      duration: 205,
      easing: Easing.inOut(Easing.quad),
    }));
  }, [active, emphasis, reduceMotion]);

  const indicator = useAnimatedStyle(() => {
    const value = emphasis.get();
    return {
      width: 8 + 23 * value,
      backgroundColor: interpolateColor(value, [0, 1], [color.track, color.lime]),
    };
  });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      disabled={disabled}
      onPress={onPress}
      style={styles.dotButton}>
      <Animated.View aria-hidden style={[styles.dot, indicator]} />
    </Pressable>
  );
}

type Props = {
  labels: readonly string[];
  step: number;
  disabled: boolean;
  onSelect: (index: number) => void;
};

export default function OnboardingPagePagination({ labels, step, disabled, onSelect }: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <View style={styles.pagination}>
      <View style={styles.progress}>
        {labels.map((label, index) => (
          <PaginationDot
            key={label}
            active={index === step}
            disabled={disabled}
            label={`Étape ${index + 1} sur ${labels.length}, ${label}${index === step ? ', étape actuelle' : ''}`}
            reduceMotion={reduceMotion}
            onPress={() => onSelect(index)}
          />
        ))}
      </View>
    </View>
  );
}
