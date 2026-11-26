import { StyleSheet } from "react-native";

import { CaptureColors } from "@/styles/theme";

export const styles = StyleSheet.create({
  root: { alignItems: "center", paddingTop: 8 },
  mascot: { width: 170, height: 170 },
  label: { color: CaptureColors.foreground, fontSize: 30, fontWeight: "900", marginTop: 4 },
  score: {
    color: CaptureColors.accent,
    fontSize: 84,
    fontWeight: "900",
    letterSpacing: -3,
    fontVariant: ["tabular-nums"],
  },
  total: { color: CaptureColors.foreground, fontSize: 44, letterSpacing: -1 },
});
