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
});
