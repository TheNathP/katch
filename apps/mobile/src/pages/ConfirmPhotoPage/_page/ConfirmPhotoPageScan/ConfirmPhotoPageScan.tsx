import { AndroidHaptics, performAndroidHapticsAsync, selectionAsync } from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { Platform, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import Icon from '@/components/ui/Icon';
import PhotoReticle, { photoReticleSize } from '@/components/ui/PhotoReticle';
import type { ChallengeAttempt } from '@/data/challenge-attempt';
import { useTheme } from '@/hooks/use-theme';
import { containPhoto } from '@/lib/photo-fit';

import { styles } from './ConfirmPhotoPageScan.styles';

type Size = { width: number; height: number };

type Props = {
  frame: Size;
  photoSize?: Size;
  attempt?: ChallengeAttempt;
  onComplete: () => void;
};

const probes = [{ x: 0.28, y: 0.29 }, { x: 0.72, y: 0.57 }, { x: 0.43, y: 0.5 }];
const TARGET_MOVE_DURATION = 155;
const PROBE_FEEDBACK_DELAY = 135;
const fadeConfig = { easing: Easing.out(Easing.cubic) };

export default function ConfirmPhotoPageScan({ frame, photoSize, attempt, onComplete }: Props) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(reduceMotion ? 2 : 0);
  const [settling, setSettling] = useState(false);
  const lastHapticStep = useRef<number | undefined>(undefined);
  const x = useSharedValue(probes[0].x);
  const y = useSharedValue(probes[0].y);
  const dial = useSharedValue(0);
  const miss = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    const second = setTimeout(() => setStep(1), 230);
    const wait = setTimeout(() => setStep(2), 485);
    return () => {
      clearTimeout(second);
      clearTimeout(wait);
    };
  }, [reduceMotion]);

  useEffect(() => {
    if (step !== 2 || !attempt) return;
    const timer = setTimeout(onComplete, reduceMotion ? 110 : attempt.matchedArea ? 265 : 85);
    return () => clearTimeout(timer);
  }, [attempt, onComplete, reduceMotion, step]);

  const finalArea = step === 2 ? attempt?.matchedArea : undefined;
  const hasFrame = frame.width > 0 && frame.height > 0;
  const isProbe = step < 2;
  const canSignal = hasFrame && (isProbe || !!finalArea);

  useEffect(() => {
    if (!canSignal || reduceMotion || lastHapticStep.current === step) return;
    const timer = setTimeout(() => {
      lastHapticStep.current = step;
      if (Platform.OS === 'android') {
        const feedback = isProbe ? AndroidHaptics.Segment_Frequent_Tick : AndroidHaptics.Segment_Tick;
        void performAndroidHapticsAsync(feedback).catch(() => {});
      } else if (Platform.OS === 'ios') {
        void selectionAsync().catch(() => {});
      }
    }, isProbe ? PROBE_FEEDBACK_DELAY : TARGET_MOVE_DURATION);
    return () => clearTimeout(timer);
  }, [canSignal, isProbe, reduceMotion, step]);

  const point = finalArea
    ? { x: finalArea.x + finalArea.width / 2, y: finalArea.y + finalArea.height / 2 }
    : probes[step];

  useEffect(() => {
    if (reduceMotion) {
      x.set(point.x);
      y.set(point.y);
      dial.set(1);
      return;
    }

    x.set(withTiming(point.x, { ...fadeConfig, duration: TARGET_MOVE_DURATION }));
    y.set(withTiming(point.y, { ...fadeConfig, duration: TARGET_MOVE_DURATION }));
    dial.set(withSequence(withTiming(0, { duration: 65 }), withTiming(1, { ...fadeConfig, duration: 145 })));
    if (step < 2) {
      miss.set(withDelay(PROBE_FEEDBACK_DELAY, withTiming(1, { duration: 75 })));
    }
    return () => {
      cancelAnimation(x);
      cancelAnimation(y);
      cancelAnimation(dial);
      cancelAnimation(miss);
      miss.set(0);
    };
  }, [dial, miss, point.x, point.y, reduceMotion, step, x, y]);

  useEffect(() => {
    if (step !== 2 || attempt) return;
    const timer = setTimeout(() => setSettling(true), 650);
    return () => clearTimeout(timer);
  }, [attempt, step]);

  const image = containPhoto(frame, photoSize ?? attempt?.photoSize);

  const position = useAnimatedStyle(() => ({
    transform: [
      { translateX: image.left + x.get() * image.width - photoReticleSize / 2 },
      { translateY: image.top + y.get() * image.height - photoReticleSize / 2 },
    ],
  }));
  const reticle = useAnimatedStyle(() => ({
    opacity: interpolate(dial.get(), [0, 1], [0.38, 1]),
    transform: [{ scale: interpolate(dial.get(), [0, 1], [1.27, 1]) }],
  }));
  const rejection = useAnimatedStyle(() => ({
    opacity: miss.get(),
    transform: [{ scale: 0.76 + 0.24 * miss.get() }],
  }));

  const status = finalArea ? 'Zone repérée'
    : attempt && step === 2 ? 'Analyse terminée'
      : settling ? 'Analyse toujours en cours…' : 'Analyse de la couleur…';

  return (
    <View pointerEvents="none" style={styles.layer}>
      <View aria-hidden style={styles.scrim} />
      {hasFrame && (!reduceMotion || finalArea) && (
        <Animated.View aria-hidden style={[styles.finder, position]}>
          <Animated.View style={reticle}>
            <PhotoReticle color={finalArea ? attempt?.matchedHex : undefined}>
              {step < 2 && (
                <Animated.View style={[styles.miss, { backgroundColor: theme.dailyCard, borderColor: theme.danger }, rejection]}>
                  <Icon name="xMark" size={13} color={theme.danger} />
                </Animated.View>
              )}
            </PhotoReticle>
          </Animated.View>
        </Animated.View>
      )}
      <View style={styles.statusRow}>
        <Text accessibilityLiveRegion="polite" accessibilityState={{ busy: !attempt }} style={[styles.status, { color: theme.dailyInk, backgroundColor: theme.dailyCard }]}>{status}</Text>
      </View>
    </View>
  );
}
