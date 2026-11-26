import { StyleSheet } from "react-native";

import { CaptureColors, Spacing } from "@/styles/theme";

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: CaptureColors.backdrop },
  empty: { alignItems: "stretch", justifyContent: "center", gap: Spacing.three, padding: Spacing.four },
  emptyText: { color: CaptureColors.foreground, fontSize: 18, fontWeight: "700", textAlign: "center" },
  content: { gap: Spacing.four, paddingHorizontal: Spacing.four, paddingBottom: Spacing.four },
  actions: { flexDirection: "row", gap: 12, paddingHorizontal: Spacing.four, paddingVertical: Spacing.three },
  secondary: {
    flex: 1,
    minHeight: 54,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    backgroundColor: CaptureColors.panel,
    borderWidth: 1,
    borderColor: CaptureColors.controlBorder,
  },
  secondaryPressed: { backgroundColor: CaptureColors.controlPressed },
  secondaryIcon: { width: 20, height: 20 },
  secondaryLabel: { color: CaptureColors.foreground, fontSize: 17, fontWeight: "800" },
  primary: { flex: 1.3 },
});
