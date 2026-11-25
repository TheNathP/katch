import { type LayoutChangeEvent, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { burstSize, styles } from './HomePageChallengeBurst.styles';

type Props = {
  color: string;
  progress: SharedValue<number>;
};

export const revealStart = 0.5;

const sparks = [
  { x: 18, y: 19, length: 8, angle: -46 },
  { x: 56, y: 9, length: 6, angle: 12 },
  { x: 78, y: 30, length: 9, angle: 62 },
  { x: 79, y: 63, length: 6, angle: -66 },
  { x: 35, y: 78, length: 8, angle: 22 },
  { x: 12, y: 56, length: 5, angle: 75 },
];

export default function HomePageChallengeBurst({ color, progress }: Props) {
  const coverScale = useSharedValue(0);

  const measureField = ({ nativeEvent: { layout: { width, height } } }: LayoutChangeEvent) => {
    coverScale.set((Math.hypot(width, height) + 8) / burstSize);
  };

  const fill = useAnimatedStyle(() => {
    const phase = progress.get();
    return {
      opacity: interpolate(phase, [revealStart, 0.52], [0, 1], Extrapolation.CLAMP),
      transform: [{
        scale: coverScale.get() * interpolate(
          phase, [revealStart, 0.54, 0.63, 0.7, 0.76], [0.04, 0.15, 0.73, 0.94, 1], Extrapolation.CLAMP,
        ),
      }],
    };
  });

  const ring = useAnimatedStyle(() => {
    const phase = progress.get();
    return {
      opacity: interpolate(phase, [revealStart, 0.54, 0.59, 0.72], [0, 0.9, 0.7, 0], Extrapolation.CLAMP),
      transform: [{
        scale: coverScale.get() * interpolate(
          phase, [revealStart, 0.54, 0.63, 0.73], [0.04, 0.25, 0.92, 1.13], Extrapolation.CLAMP,
        ),
      }],
    };
  });

  const scatter = useAnimatedStyle(() => {
    const phase = progress.get();
    return {
      opacity: interpolate(phase, [0.52, 0.56, 0.62, 0.7], [0, 1, 0.75, 0], Extrapolation.CLAMP),
      transform: [{
        scale: interpolate(phase, [0.52, 0.58, 0.7], [0.45, 1.4, 2.6], Extrapolation.CLAMP),
      }],
    };
  });

  return (
    <View onLayout={measureField} style={styles.field}>
      <View style={styles.center}>
        <Animated.View style={[styles.disc, { backgroundColor: color }, fill]} />
        <Animated.View style={[styles.disc, styles.ring, ring]} />
        <Animated.View style={[styles.sparks, scatter]}>
          {sparks.map(({ x, y, length, angle }) => (
            <View
              key={x}
              style={[styles.spark, {
                left: x,
                top: y,
                height: length,
                transform: [{ rotate: `${angle}deg` }],
              }]}
            />
          ))}
        </Animated.View>
      </View>
    </View>
  );
}
