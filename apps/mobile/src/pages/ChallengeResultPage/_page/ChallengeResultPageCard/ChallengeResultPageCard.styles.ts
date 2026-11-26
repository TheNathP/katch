import { StyleSheet } from "react-native";

import { CaptureColors, Spacing } from "@/styles/theme";

export const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 28,
    backgroundColor: CaptureColors.panel,
    borderWidth: 1,
    borderColor: CaptureColors.controlBorder,
  },
  photo: { width: "100%", aspectRatio: 16 / 9, borderRadius: 20 },
  colors: { flexDirection: "row", justifyContent: "space-between", gap: Spacing.two },
  colorRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  targetRow: { justifyContent: "flex-end" },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: CaptureColors.controlBorder,
  },
  colorCaption: { color: CaptureColors.muted, fontSize: 12, fontWeight: "700" },
  hex: { color: CaptureColors.foreground, fontSize: 17, fontWeight: "900", fontVariant: ["tabular-nums"] },
  alignEnd: { textAlign: "right" },
  track: { height: 16, borderRadius: 8, overflow: "hidden", backgroundColor: CaptureColors.control },
  fill: { height: "100%", borderRadius: 8, backgroundColor: CaptureColors.accent },
  feedback: {
    alignItems: "center",
    gap: 4,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: 20,
    backgroundColor: CaptureColors.feedback,
  },
  feedbackTitle: { color: CaptureColors.accent, fontSize: 26, fontWeight: "900", fontStyle: "italic" },
  feedbackMessage: { color: CaptureColors.foreground, fontSize: 16, textAlign: "center" },
  meta: { color: CaptureColors.muted, fontSize: 14, textAlign: "center", lineHeight: 20 },
});
