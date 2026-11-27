import { StyleSheet } from "react-native";

import { Spacing } from "@/styles/theme";

export const styles = StyleSheet.create({
  chevron: { width: 11, height: 14 },
  shortcuts: { gap: Spacing.two },
  shortcutGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.two },
  shortcut: {
    flex: 1, minWidth: 0, minHeight: 57, alignSelf: "stretch", alignItems: "center",
    flexDirection: "row", borderRadius: 17, borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.two, paddingVertical: Spacing.two, gap: Spacing.two,
  },
  shortcutFull: { flexBasis: "100%" },
  shortcutIcon: { width: 33, height: 33, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  shortcutArt: { width: 22, height: 22 },
  shortcutIllustration: { width: "100%", height: "100%" },
  shortcutLabel: { flex: 1, minWidth: 0, fontWeight: "800", fontSize: 13, lineHeight: 17 },
  historyLink: {
    alignSelf: "stretch", flexDirection: "row", minHeight: 51, gap: Spacing.two,
    paddingVertical: Spacing.one, paddingHorizontal: 10, borderRadius: 16,
  },
  historyArt: { width: 30, height: 34 },
  historyLabel: { flex: 1, fontWeight: "800" },
});
