import { Text, View } from "react-native";

import type { ChallengeAttempt } from "@/data/challenge-attempt";
import ChallengeResultPagePhoto from "@/pages/ChallengeResultPage/_page/ChallengeResultPagePhoto";

import { styles } from "./ChallengeResultPageCard.styles";

type Props = { attempt: ChallengeAttempt };

export default function ChallengeResultPageCard({ attempt }: Props) {
  return (
    <View style={styles.card}>
      <ChallengeResultPagePhoto attempt={attempt} />

      <View style={styles.colors}>
        <View style={styles.colorRow}>
          <View
            aria-hidden
            style={[styles.swatch, { backgroundColor: attempt.matchedHex }]}
          />
          <View>
            <Text style={styles.colorCaption}>Ta couleur</Text>
            <Text style={styles.hex}>{attempt.matchedHex}</Text>
          </View>
        </View>
        <View style={[styles.colorRow, styles.targetRow]}>
          <View>
            <Text style={[styles.colorCaption, styles.alignEnd]}>
              Couleur du jour
            </Text>
            <Text style={[styles.hex, styles.alignEnd]}>
              {attempt.targetHex}
            </Text>
          </View>
          <View
            aria-hidden
            style={[styles.swatch, { backgroundColor: attempt.targetHex }]}
          />
        </View>
      </View>
    </View>
  );
}
