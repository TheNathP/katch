import { StyleSheet } from "react-native";

import { Spacing } from "@/styles/theme";

export const styles = StyleSheet.create({
  comparison: { width: "100%", borderTopWidth: StyleSheet.hairlineWidth, padding: Spacing.two + Spacing.one },
  colors: { flexDirection: "row", gap: Spacing.two },
  colorsStacked: { flexDirection: "column" },
  color: { flex: 1, gap: Spacing.one + Spacing.half },
  caption: { gap: 1, paddingHorizontal: Spacing.one, paddingBottom: Spacing.one },
  swatch: { width: "100%", height: 30, borderRadius: 8, borderWidth: 1 },
  colorCaption: { fontSize: 12, fontWeight: "700" },
  hex: { fontSize: 15, fontWeight: "900", fontVariant: ["tabular-nums"] },
});
