import { StyleSheet } from "react-native";

import { AvatarTokens, Spacing } from "@/styles/theme";

export const styles = StyleSheet.create({
  picker: {
    gap: Spacing.three,
  },
  preview: {
    alignSelf: "center",
    alignItems: "center",
  },
  status: {
    textAlign: "center",
  },
  previewPressed: {
    opacity: 0.8,
  },
  editBadge: {
    marginTop: -Spacing.three,
    paddingHorizontal: Spacing.two + Spacing.one,
    paddingVertical: Spacing.one,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: AvatarTokens.editBadgeBorder,
    backgroundColor: AvatarTokens.editBadgeBackground,
  },
  editBadgeLabel: {
    color: AvatarTokens.editBadgeForeground,
    fontSize: 13,
    fontWeight: "700",
  },
  lists: {
    gap: Spacing.two,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  option: {
    borderRadius: 999,
    borderWidth: 3,
    borderColor: "transparent",
    padding: Spacing.half,
  },
  optionSelected: {
    borderColor: AvatarTokens.selectedBorder,
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
});
