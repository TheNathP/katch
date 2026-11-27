import { StyleSheet } from "react-native";

import { Spacing } from "@/styles/theme";

export const styles = StyleSheet.create({
  summary: { width: "100%", alignItems: "center", gap: Spacing.one },
  readout: { width: "100%", minWidth: 0, paddingHorizontal: Spacing.one },
  beforeReveal: { opacity: 0 },
  score: {
    width: "100%", textAlign: "center", fontSize: 76, lineHeight: 88, letterSpacing: -4,
    fontWeight: "900", fontVariant: ["tabular-nums"],
  },
  caption: { textAlign: "center", fontSize: 15, fontWeight: "700" },
  progress: { width: "69%", maxWidth: 250, marginTop: Spacing.two },
});
