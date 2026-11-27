import { StyleSheet } from "react-native";

import { CaptureColors, Spacing } from "@/styles/theme";

export const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.four,
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  active: {
    backgroundColor: CaptureColors.accent,
    borderColor: CaptureColors.accent,
  },
  activePressed: { opacity: 0.88 },
  icon: { width: 22, height: 22 },
});
