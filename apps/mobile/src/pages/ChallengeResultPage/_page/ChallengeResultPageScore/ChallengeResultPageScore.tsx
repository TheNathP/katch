import { Image, type ImageProps } from "expo-image";
import { Text, View } from "react-native";

import type { ScoreTier } from "@/lib/score-feedback";

import { styles } from "./ChallengeResultPageScore.styles";

const mascots: Record<ScoreTier, ImageProps["source"]> = {
  perfect: require("@/assets/images/pix/star-eyes.png"),
  great: require("@/assets/images/pix/happy.png"),
  good: require("@/assets/images/pix/confident.png"),
  miss: require("@/assets/images/pix/sad.png"),
};

type Props = { score: number; tier: ScoreTier };

export default function ChallengeResultPageScore({ score, tier }: Props) {
  return (
    <View accessible accessibilityLabel={`Ton score : ${score} sur 100`} style={styles.root}>
      <Image aria-hidden source={mascots[tier]} contentFit="contain" style={styles.mascot} />
      <Text style={styles.label}>Ton score</Text>
      <Text style={styles.score}>
        {score}
        <Text style={styles.total}>/100</Text>
      </Text>
    </View>
  );
}
