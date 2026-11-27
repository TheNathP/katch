import { AndroidHaptics, NotificationFeedbackType, notificationAsync, performAndroidHapticsAsync } from 'expo-haptics';
import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import { Platform, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { styles } from './CaptureFeedback.styles';
import { ComicBackdrop, ComicHeadline, ComicOutcomeMark } from './CaptureFeedbackMark';
import CaptureFeedbackWave from './CaptureFeedbackWave';

const comicWin = require('@/assets/images/pix/comic-win.png');
const comicMiss = require('@/assets/images/pix/comic-miss.png');

const readTime = 1250;
const reducedMotionReadTime = 1050;
const waveDuration = 445;

type Props = {
  validated: boolean;
  revealing: boolean;
  holdDuration?: number;
  successHaptic?: boolean;
  onReveal: () => void;
  onComplete: () => void;
};

export default function CaptureFeedback({
  validated,
  revealing,
  holdDuration,
  successHaptic = false,
  onReveal,
  onComplete,
}: Props) {
  const reduceMotion = useReducedMotion();
  const [ready, setReady] = useState(false);
  const signalledOutcome = useRef(false);
  const waveProgress = useSharedValue(0);
  const impact = useSharedValue(reduceMotion ? 1 : 0);
  const safeArea = useSafeAreaInsets();

  useEffect(() => {
    if (!ready) return;
    if (!reduceMotion) {
      impact.set(withTiming(1, { duration: 220, easing: Easing.out(Easing.back(1.2)) }));
    }

    const timeout = setTimeout(onReveal, holdDuration ?? (reduceMotion ? reducedMotionReadTime : readTime));
    return () => {
      clearTimeout(timeout);
      cancelAnimation(impact);
    };
  }, [holdDuration, impact, onReveal, ready, reduceMotion]);

  useEffect(() => {
    if (!ready || revealing || signalledOutcome.current || (validated && !successHaptic)) return;
    signalledOutcome.current = true;
    if (Platform.OS === 'android') {
      void performAndroidHapticsAsync(validated ? AndroidHaptics.Confirm : AndroidHaptics.Reject).catch(() => {});
    } else if (Platform.OS === 'ios') {
      void notificationAsync(validated ? NotificationFeedbackType.Success : NotificationFeedbackType.Warning).catch(() => {});
    }
  }, [ready, revealing, successHaptic, validated]);

  useEffect(() => {
    if (!revealing) return;
    if (reduceMotion) {
      onComplete();
      return;
    }
    waveProgress.set(withTiming(1, { duration: waveDuration, easing: Easing.inOut(Easing.cubic) }, (finished) => {
      if (finished) scheduleOnRN(onComplete);
    }));
    return () => cancelAnimation(waveProgress);
  }, [onComplete, reduceMotion, revealing, waveProgress]);

  const art = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(impact.get(), [0, 1], [1.045, 1]) }],
  }));
  const headline = useAnimatedStyle(() => ({
    transform: [
      { rotate: '-11deg' },
      { scaleY: interpolate(impact.get(), [0, 1], [0.9, 1]) },
    ],
  }));

  return (
    <View
      aria-hidden={!ready}
      accessibilityElementsHidden={!ready}
      importantForAccessibility={ready ? 'auto' : 'no-hide-descendants'}
      style={[styles.feedback, !ready && styles.waiting]}>
      <CaptureFeedbackWave progress={waveProgress} validated={validated}>
        <View aria-hidden pointerEvents="none" style={styles.backdrop}>
          <ComicBackdrop validated={validated} />
        </View>
        <Animated.View style={[styles.art, safeArea, art]}>
          <View style={styles.comic}>
            <View
              aria-hidden
              pointerEvents="none"
              style={[styles.pixLayer, { transform: [{ rotate: validated ? '-3deg' : '3deg' }] }]}>
              <Image
                source={validated ? comicWin : comicMiss}
                contentFit="contain"
                loading="eager"
                priority="high"
                onLoad={() => setReady(true)}
                onError={() => setReady(true)}
                style={styles.sprite}
              />
            </View>
            <Animated.View
              accessible
              accessibilityRole="header"
              accessibilityLiveRegion="polite"
              accessibilityLabel={validated ? 'Capture validée' : 'Capture non validée'}
              style={[styles.headline, headline]}>
              <View aria-hidden style={styles.lettering}>
                <ComicHeadline validated={validated} />
              </View>
            </Animated.View>
            {!validated && (
              <View aria-hidden pointerEvents="none" style={styles.mark}>
                <ComicOutcomeMark />
              </View>
            )}
          </View>
        </Animated.View>
      </CaptureFeedbackWave>
    </View>
  );
}
