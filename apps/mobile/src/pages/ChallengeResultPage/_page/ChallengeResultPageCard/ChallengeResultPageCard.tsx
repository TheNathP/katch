import { Image } from "expo-image";
import { Text, View } from "react-native";

import type { ChallengeAttempt } from "@/data/challenge-attempt";
import type { ScoreFeedback } from "@/lib/score-feedback";

import { styles } from "./ChallengeResultPageCard.styles";

type Props = { attempt: ChallengeAttempt; feedback: ScoreFeedback };

export default function ChallengeResultPageCard({ attempt, feedback }: Props) {
  const showBest = attempt.bestScore > attempt.score;

  return (
    <View style={styles.card}>
      <Image
        source={{ uri: attempt.photoUri }}
        contentFit="cover"
        accessibilityLabel="Ta photo"
        style={styles.photo}
      />

      <View style={styles.colors}>
        <View style={styles.colorRow}>
          <View aria-hidden style={[styles.swatch, { backgroundColor: attempt.matchedHex }]} />
          <View>
            <Text style={styles.colorCaption}>Ta couleur</Text>
            <Text style={styles.hex}>{attempt.matchedHex}</Text>
          </View>
        </View>
        <View style={[styles.colorRow, styles.targetRow]}>
          <View>
            <Text style={[styles.colorCaption, styles.alignEnd]}>Couleur du jour</Text>
            <Text style={[styles.hex, styles.alignEnd]}>{attempt.targetHex}</Text>
          </View>
          <View aria-hidden style={[styles.swatch, { backgroundColor: attempt.targetHex }]} />
        </View>
      </View>

      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: 100, now: attempt.score }}
        style={styles.track}
      >
        <View style={[styles.fill, { width: `${attempt.score}%` }]} />
      </View>

      <View style={styles.feedback}>
        <Text style={styles.feedbackTitle}>{feedback.title}</Text>
        <Text style={styles.feedbackMessage}>{feedback.message}</Text>
      </View>

      <Text style={styles.meta}>
        {showBest ? `Ton meilleur score du jour reste ${attempt.bestScore}/100. ` : ""}
        {attempt.attemptsLeft > 0
          ? `Il te reste ${attempt.attemptsLeft} essai${attempt.attemptsLeft > 1 ? "s" : ""} aujourd’hui.`
          : "Tu as utilisé tous tes essais du jour."}
      </Text>
    </View>
  );
}
