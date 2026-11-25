import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import HomePageChallengeBurst, { revealStart } from '@/pages/HomePage/_page/HomePageChallengeBurst';

import { styles } from './HomePageChallengeVeil.styles';

type Props = {
  color: string;
  idle: boolean;
  revealing: boolean;
  progress: SharedValue<number>;
};

const hintInterval = 2_800;

export default function HomePageChallengeVeil({ color, idle, revealing, progress }: Props) {
  const hint = useSharedValue(0);
  const reduceMotion = useReducedMotion();

  useFocusEffect(useCallback(() => {
    if (!idle || reduceMotion) return;

    const timer = setInterval(() => {
      hint.set(withSequence(
        withTiming(1, { duration: 170, easing: Easing.out(Easing.quad) }),
        withTiming(-0.32, { duration: 145 }),
        withTiming(0, { duration: 230 }),
      ));
    }, hintInterval);

    return () => {
      clearInterval(timer);
      cancelAnimation(hint);
      hint.set(0);
    };
  }, [hint, idle, reduceMotion]));

  const questionMotion = useAnimatedStyle(() => {
    const amount = progress.get();
    const nudge = hint.get();
    const suspense = interpolate(
      amount,
      [0.13, 0.21, 0.28, 0.34, 0.41, 0.48, 0.55],
      [0, 0.55, 0, 0.9, 0.15, -1.45, 1.4],
      Extrapolation.CLAMP,
    );
    return {
      opacity: interpolate(amount, [revealStart, 0.57], [1, 0], Extrapolation.CLAMP),
      transform: [
        { translateY: -7 * nudge - 4 * suspense },
        { rotate: `${-7 * nudge + 5 * suspense}deg` },
        { scale: 1 + 0.08 * nudge + 0.13 * suspense },
      ],
    };
  });

  return (
    <View pointerEvents="none" style={styles.veil}>
      {revealing && <HomePageChallengeBurst color={color} progress={progress} />}
      <Animated.Text style={[styles.question, questionMotion]}>?</Animated.Text>
    </View>
  );
}
