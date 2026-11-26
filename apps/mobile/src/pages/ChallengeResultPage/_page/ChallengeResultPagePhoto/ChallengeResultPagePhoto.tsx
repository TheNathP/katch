import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import type { ChallengeAttempt } from "@/data/challenge-attempt";

import { styles } from "./ChallengeResultPagePhoto.styles";

const SCAN_DURATION = 800;
const RING_MIN = 56;
const RING_MAX = 112;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

type Props = { attempt: ChallengeAttempt };

/**
 * The scored photo, shown whole. Once shown, a scan sweeps it and a ring lands on the area where the
 * server found the color closest to the target. Tap the photo to replay.
 */
export default function ChallengeResultPagePhoto({ attempt }: Props) {
  const { photoUri, photoSize, matchedArea, matchedHex } = attempt;
  const reduceMotion = useReducedMotion();
  const [boxWidth, setBoxWidth] = useState(0);
  const [replays, setReplays] = useState(0);
  const scan = useSharedValue(0);
  const dim = useSharedValue(0);
  const ring = useSharedValue(0);
  const ripple = useSharedValue(0);

  const ratio = photoSize.width / photoSize.height;
  const boxHeight = boxWidth / ratio;
  const located = matchedArea !== null && boxWidth > 0;
  const centerX = matchedArea
    ? (matchedArea.x + matchedArea.width / 2) * boxWidth
    : 0;
  const centerY = matchedArea
    ? (matchedArea.y + matchedArea.height / 2) * boxHeight
    : 0;
  const ringSize = matchedArea
    ? clamp(
        Math.max(matchedArea.width * boxWidth, matchedArea.height * boxHeight) *
          3,
        RING_MIN,
        RING_MAX,
      )
    : 0;

  useEffect(() => {
    if (!located) return;
    const values = [scan, dim, ring, ripple];
    values.forEach((value) => value.set(0));

    if (reduceMotion) {
      scan.set(1);
      ring.set(withTiming(1, { duration: 200 }));
      return () => values.forEach(cancelAnimation);
    }

    scan.set(
      withTiming(1, {
        duration: SCAN_DURATION,
        easing: Easing.inOut(Easing.quad),
      }),
    );
    dim.set(
      withSequence(
        withTiming(1, { duration: 220 }),
        withDelay(SCAN_DURATION - 220, withTiming(0.5, { duration: 400 })),
      ),
    );
    ring.set(
      withDelay(SCAN_DURATION, withSpring(1, { damping: 12, stiffness: 170 })),
    );
    ripple.set(
      withDelay(
        SCAN_DURATION + 320,
        withRepeat(
          withTiming(1, { duration: 1000, easing: Easing.out(Easing.quad) }),
          3,
          false,
        ),
      ),
    );
    return () => values.forEach(cancelAnimation);
  }, [located, replays, reduceMotion, scan, dim, ring, ripple]);

  const scrimStyle = useAnimatedStyle(() => ({ opacity: dim.get() }));
  const scanStyle = useAnimatedStyle(() => {
    const progress = scan.get();
    return {
      opacity: interpolate(progress, [0, 0.05, 0.9, 1], [0, 1, 1, 0], "clamp"),
      transform: [{ translateY: progress * boxHeight - 1.5 }],
    };
  });
  const ringStyle = useAnimatedStyle(() => {
    const progress = ring.get();
    return {
      opacity: interpolate(progress, [0, 0.3], [0, 1], "clamp"),
      transform: [{ scale: interpolate(progress, [0, 1], [2.6, 1]) }],
    };
  });
  const rippleStyle = useAnimatedStyle(() => {
    const progress = ripple.get();
    return {
      opacity: progress === 0 ? 0 : 0.8 * (1 - progress),
      transform: [{ scale: 1 + progress }],
    };
  });
  const circle = {
    left: centerX - ringSize / 2,
    top: centerY - ringSize / 2,
    width: ringSize,
    height: ringSize,
    borderRadius: ringSize / 2,
  };

  return (
    <Pressable
      accessibilityRole={located ? "button" : "image"}
      accessibilityHint={
        located ? "Rejoue l’animation qui montre ta couleur" : undefined
      }
      disabled={!located}
      onPress={() => setReplays((count) => count + 1)}
      onLayout={(event) => setBoxWidth(event.nativeEvent.layout.width)}
      style={[styles.frame, { aspectRatio: ratio }]}
    >
      <Image
        source={{ uri: photoUri }}
        contentFit="contain"
        style={styles.photo}
      />
      {located && (
        <View aria-hidden pointerEvents="none" style={styles.photo}>
          <Animated.View style={[styles.scrim, scrimStyle]} />
          <Animated.View style={[styles.scan, scanStyle]} />
          <Animated.View style={[styles.ripple, circle, rippleStyle]} />
          <Animated.View style={[styles.ring, circle, ringStyle]} />
          <Animated.View
            style={[
              styles.dot,
              {
                left: centerX - 8,
                top: centerY - 8,
                backgroundColor: matchedHex,
              },
              ringStyle,
            ]}
          />
        </View>
      )}
    </Pressable>
  );
}
