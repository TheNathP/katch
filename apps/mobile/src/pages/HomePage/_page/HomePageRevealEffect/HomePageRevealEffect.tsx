import { useFocusEffect } from 'expo-router';
import { type ComponentRef, type RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  Extrapolation,
  interpolate,
  ReduceMotion,
  type SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { useScreenOverlay } from '@/components/shared/ScreenOverlay';

import HomePageChallengeVeil from '../HomePageChallengeVeil';
import { styles } from './HomePageRevealEffect.styles';

type Props = {
  date: string;
  color: string;
  progress: SharedValue<number>;
  swatchRef: RefObject<ComponentRef<typeof View> | null>;
  onComplete: (date: string) => void;
};

type Placement = { left: number; top: number; width: number; height: number };

const motion = {
  duration: 2_200,
  easing: Easing.linear,
  reduceMotion: ReduceMotion.System,
};

function RevealLayer({ date, color, progress, swatchRef, onComplete }: Props) {
  const layerRef = useRef<ComponentRef<typeof View>>(null);
  const [placement, setPlacement] = useState<Placement>();
  const placed = placement !== undefined;

  const measureSwatch = useCallback(() => {
    const layer = layerRef.current;
    const swatch = swatchRef.current;
    if (!layer || !swatch) return;

    // The overlay and the swatch share the same native window and its insets.
    layer.measureInWindow((originX, originY) => {
      swatch.measureInWindow((x, y, width, height) => {
        if (width > 0 && height > 0) {
          setPlacement({ left: x - originX, top: y - originY, width, height });
        }
      });
    });
  }, [swatchRef]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onComplete(date);
      return true;
    });
    return () => subscription.remove();
  }, [date, onComplete]);

  useEffect(() => {
    if (!placed) {
      const timeout = setTimeout(() => onComplete(date), motion.duration);
      return () => clearTimeout(timeout);
    }

    progress.set(0);
    progress.set(withTiming(1, motion, (finished) => {
      if (finished) scheduleOnRN(onComplete, date);
    }));

    return () => {
      cancelAnimation(progress);
      progress.set(0);
    };
  }, [date, onComplete, placed, progress]);

  const dim = useAnimatedStyle(() => ({
    opacity: interpolate(progress.get(), [0.015, 0.14, 0.79, 0.98], [0, 0.84, 0.84, 0], Extrapolation.CLAMP),
  }));

  return (
    <View ref={layerRef} collapsable={false} onLayout={measureSwatch} style={styles.overlay} aria-hidden>
      {placement && (
        <>
          <Animated.View style={[styles.scrim, dim]} />
          <View style={[styles.foreground, placement]}>
            <HomePageChallengeVeil color={color} idle={false} revealing progress={progress} />
          </View>
        </>
      )}
    </View>
  );
}

export default function HomePageRevealEffect({ date, color, progress, swatchRef, onComplete }: Props) {
  const showOverlay = useScreenOverlay();
  const reduceMotion = useReducedMotion();

  useFocusEffect(useCallback(() => {
    if (reduceMotion) {
      onComplete(date);
      return;
    }

    return showOverlay(
      <RevealLayer date={date} color={color} progress={progress} swatchRef={swatchRef} onComplete={onComplete} />,
    );
  }, [color, date, onComplete, progress, reduceMotion, showOverlay, swatchRef]));

  return null;
}
