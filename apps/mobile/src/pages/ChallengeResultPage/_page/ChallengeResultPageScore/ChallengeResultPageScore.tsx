import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";

import ProgressBar from "@/components/ui/ProgressBar";
import { useTheme } from "@/hooks/use-theme";
import { formatChallengePercent, minimumCaptureScore } from "@/lib/score-feedback";

import { styles } from "./ChallengeResultPageScore.styles";

type Props = { score: number; scorePercent: number; play: boolean; revealDuration: number };

export default function ChallengeResultPageScore({ score, scorePercent, play, revealDuration }: Props) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const [shown, setShown] = useState(0);
  const fill = useSharedValue(0);
  const entrance = useSharedValue(0);
  const validated = score >= minimumCaptureScore;

  useEffect(() => {
    if (!play || reduceMotion) return;
    fill.set(withTiming(scorePercent, { duration: revealDuration, easing: Easing.out(Easing.cubic) }));
    entrance.set(withTiming(1, { duration: 260, easing: Easing.out(Easing.cubic) }));

    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const time = Math.max(0, Math.min(1, (now - start) / revealDuration));
      setShown(time === 1 ? scorePercent : Math.floor(scorePercent * (1 - (1 - time) ** 3) * 10) / 10);
      if (time < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimation(fill);
      cancelAnimation(entrance);
    };
  }, [entrance, fill, play, reduceMotion, revealDuration, scorePercent]);

  const motion = useAnimatedStyle(() => ({
    opacity: play ? entrance.get() : 0,
    transform: [{ translateY: (1 - entrance.get()) * 7 }],
  }));

  return (
    <View
      accessible
      accessibilityRole="header"
      accessibilityLabel={`Correspondance, ${formatChallengePercent(scorePercent)}.`}
      style={styles.summary}
    >
      <Animated.View style={[styles.readout, !reduceMotion && motion, !play && styles.beforeReveal]}>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.55}
          style={[styles.score, { color: theme.dailyAccent }]}>
          {formatChallengePercent(reduceMotion ? scorePercent : shown)}
        </Text>
      </Animated.View>
      <Text style={[styles.caption, { color: theme.dailyMuted }]}>de correspondance</Text>
      <View style={styles.progress}>
        <ProgressBar
          value={scorePercent}
          max={100}
          animatedValue={reduceMotion ? undefined : fill}
          tone={validated ? "primary" : "rejected"}
          size="small"
        />
      </View>
    </View>
  );
}
