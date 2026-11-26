import { type ComponentRef, type RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { Modal, View } from 'react-native';
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
import Svg, { Path, Rect } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';

import { DailyRevealColors, dailySwatchRadius } from '@/styles/theme';

import { styles } from './HomePageRevealEffect.styles';

type Props = {
  date: string;
  progress: SharedValue<number>;
  swatchRef: RefObject<ComponentRef<typeof View> | null>;
  onComplete: (date: string) => void;
};

type Spotlight = {
  x: number;
  y: number;
  width: number;
  height: number;
  viewportWidth: number;
  viewportHeight: number;
};

const motion = {
  duration: 2_200,
  easing: Easing.linear,
  reduceMotion: ReduceMotion.System,
};

function spotlightPath({ x, y, width, height, viewportWidth, viewportHeight }: Spotlight) {
  const right = x + width;
  const bottom = y + height;
  const radius = dailySwatchRadius;
  const corner = `A ${radius} ${radius} 0 0 1`;

  return [
    `M 0 0 H ${viewportWidth} V ${viewportHeight} H 0 Z`,
    `M ${x + radius} ${y} H ${right - radius} ${corner} ${right} ${y + radius}`,
    `V ${bottom - radius} ${corner} ${right - radius} ${bottom}`,
    `H ${x + radius} ${corner} ${x} ${bottom - radius}`,
    `V ${y + radius} ${corner} ${x + radius} ${y} Z`,
  ].join(' ');
}

export default function HomePageRevealEffect({ date, progress, swatchRef, onComplete }: Props) {
  const overlayRef = useRef<ComponentRef<typeof View>>(null);
  const [spotlight, setSpotlight] = useState<Spotlight>();
  const reduceMotion = useReducedMotion();

  const measureSpotlight = useCallback(() => {
    overlayRef.current?.measureInWindow((originX, originY, viewportWidth, viewportHeight) => {
      swatchRef.current?.measureInWindow((x, y, width, height) => {
        if (width <= 0 || height <= 0 || viewportWidth <= 0 || viewportHeight <= 0) return;
        setSpotlight({ x: x - originX, y: y - originY, width, height, viewportWidth, viewportHeight });
      });
    });
  }, [swatchRef]);

  useEffect(() => {
    if (reduceMotion) {
      onComplete(date);
      return;
    }

    progress.set(0);
    progress.set(withTiming(1, motion, (finished) => {
      if (finished) scheduleOnRN(onComplete, date);
    }));

    return () => {
      cancelAnimation(progress);
      progress.set(0);
    };
  }, [date, onComplete, progress, reduceMotion]);

  const dim = useAnimatedStyle(() => ({
    opacity: interpolate(progress.get(), [0.015, 0.14, 0.79, 0.98], [0, 0.84, 0.84, 0], Extrapolation.CLAMP),
  }));

  if (reduceMotion) return null;

  return (
    <Modal
      transparent
      statusBarTranslucent
      navigationBarTranslucent
      onShow={measureSpotlight}
      onRequestClose={() => onComplete(date)}
    >
      <View ref={overlayRef} collapsable={false} onLayout={measureSpotlight} style={styles.overlay}>
        {spotlight && (
          <Animated.View aria-hidden pointerEvents="none" style={[styles.scrim, dim]}>
            <Svg width={spotlight.viewportWidth} height={spotlight.viewportHeight}>
              <Path d={spotlightPath(spotlight)} fill={DailyRevealColors.backdrop} fillRule="evenodd" />
              <Rect
                x={spotlight.x}
                y={spotlight.y}
                width={spotlight.width}
                height={spotlight.height}
                rx={dailySwatchRadius}
                stroke={DailyRevealColors.rim}
                strokeWidth={1}
                fill="none"
              />
            </Svg>
          </Animated.View>
        )}
      </View>
    </Modal>
  );
}
