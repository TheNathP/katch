import {
  ImpactFeedbackStyle,
  impactAsync,
  NotificationFeedbackType,
  notificationAsync,
} from "expo-haptics";
import { Image, type ImageProps } from "expo-image";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import type { ScoreFeedback, ScoreTier } from "@/lib/score-feedback";

import { styles } from "./ChallengeResultPageScore.styles";

const mascots: Record<ScoreTier, ImageProps["source"]> = {
  perfect: require("@/assets/images/pix/star-eyes.png"),
  great: require("@/assets/images/pix/happy.png"),
  good: require("@/assets/images/pix/confident.png"),
  miss: require("@/assets/images/pix/sad.png"),
};

/** Fast at first, slowing down on the final value. */
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

type Props = {
  score: number;
  feedback: ScoreFeedback;
  /** How long the score takes to count up to its value, in ms. */
  revealDuration: number;
};

/**
 * The server's score, counted up from 0. Then the mascot pops in with the matching
 * mood and the comment slides in below the score.
 */
export default function ChallengeResultPageScore({
  score,
  feedback,
  revealDuration,
}: Props) {
  const { tier } = feedback;
  const reduceMotion = useReducedMotion();
  const [shown, setShown] = useState(reduceMotion ? score : 0);
  const mascot = useSharedValue(reduceMotion ? 1 : 0);
  const punch = useSharedValue(0);
  const comment = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) return;

    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / revealDuration);
      setShown(Math.round(score * easeOutCubic(progress)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    mascot.set(
      withDelay(revealDuration, withSpring(1, { damping: 9, stiffness: 150 })),
    );
    punch.set(
      withDelay(
        revealDuration,
        withSequence(
          withTiming(1, { duration: 140 }),
          withTiming(0, { duration: 260 }),
        ),
      ),
    );
    comment.set(
      withDelay(
        revealDuration + 120,
        withTiming(1, { duration: 320, easing: Easing.out(Easing.cubic) }),
      ),
    );
    const haptic = setTimeout(() => {
      const vibration =
        tier === "perfect" || tier === "great"
          ? notificationAsync(NotificationFeedbackType.Success)
          : impactAsync(ImpactFeedbackStyle.Medium);
      void vibration.catch(() => {});
    }, revealDuration);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(haptic);
      cancelAnimation(mascot);
      cancelAnimation(punch);
      cancelAnimation(comment);
    };
  }, [score, tier, revealDuration, reduceMotion, mascot, punch, comment]);

  const mascotStyle = useAnimatedStyle(() => {
    const progress = mascot.get();
    return {
      opacity: interpolate(progress, [0, 0.4], [0, 1], "clamp"),
      transform: [
        { scale: interpolate(progress, [0, 1], [0.3, 1]) },
        { rotate: `${interpolate(progress, [0, 1], [-14, 0])}deg` },
      ],
    };
  });
  const scoreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + 0.16 * punch.get() }],
  }));
  const commentStyle = useAnimatedStyle(() => ({
    opacity: comment.get(),
    transform: [{ translateY: (1 - comment.get()) * 16 }],
  }));

  return (
    <View
      accessible
      accessibilityLabel={`Ton score : ${score} sur 100. ${feedback.title} ${feedback.message}`}
      style={styles.root}
    >
      <Animated.View style={mascotStyle}>
        <Image
          aria-hidden
          source={mascots[tier]}
          contentFit="contain"
          style={styles.mascot}
        />
      </Animated.View>
      <Text style={styles.label}>Ton score</Text>
      <Animated.View style={scoreStyle}>
        <Text style={styles.score}>
          {shown}
          <Text style={styles.total}>/100</Text>
        </Text>
      </Animated.View>
      <Animated.View style={[styles.feedback, commentStyle]}>
        <Text style={styles.feedbackTitle}>{feedback.title}</Text>
        <Text style={styles.feedbackMessage}>{feedback.message}</Text>
      </Animated.View>
    </View>
  );
}
