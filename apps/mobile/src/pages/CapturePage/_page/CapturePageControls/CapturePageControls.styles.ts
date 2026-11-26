import { StyleSheet } from "react-native";

import { CaptureColors, Spacing } from "@/styles/theme";

export const styles = StyleSheet.create({
  panel: {
    gap: 18,
    paddingTop: Spacing.four,
    paddingHorizontal: Spacing.four,
    backgroundColor: CaptureColors.panel,
  },
  error: {
    color: CaptureColors.danger,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.three,
  },
  sideButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { opacity: 0.6 },
  flipIcon: { width: 30, height: 30 },
  shutter: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 4,
    borderColor: CaptureColors.foreground,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterDimmed: { opacity: 0.55 },
  shutterCenter: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CaptureColors.accent,
  },
});
