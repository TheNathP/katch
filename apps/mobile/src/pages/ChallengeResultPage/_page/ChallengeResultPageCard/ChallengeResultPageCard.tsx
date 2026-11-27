import { Text, useWindowDimensions, View } from "react-native";

import { useTheme } from "@/hooks/use-theme";
import type { ChallengeAttempt } from "@/data/challenge-attempt";

import { styles } from "./ChallengeResultPageCard.styles";

export default function ChallengeResultPageCard({ attempt }: { attempt: ChallengeAttempt }) {
  const theme = useTheme();
  const { fontScale, width } = useWindowDimensions();
  const swatches = [
    { label: "Couleur repérée", hex: attempt.matchedHex },
    { label: "Couleur du jour", hex: attempt.targetHex },
  ];
  const stackColors = fontScale > 1.3 || width < 350;

  return (
    <View style={[styles.comparison, { borderTopColor: theme.dailyBorder }]}>
      <View style={[styles.colors, stackColors && styles.colorsStacked]}>
        {swatches.map(({ label, hex }) => (
          <View key={label} accessible accessibilityLabel={`${label}, ${hex}`} style={styles.color}>
            <View aria-hidden style={[styles.swatch, { backgroundColor: hex, borderColor: theme.dailySwatchBorder }]} />
            <View style={styles.caption}>
              <Text style={[styles.colorCaption, { color: theme.dailyMuted }]}>{label}</Text>
              <Text style={[styles.hex, { color: theme.dailyInk }]}>{hex}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
