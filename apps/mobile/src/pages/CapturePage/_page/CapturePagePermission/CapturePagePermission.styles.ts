import { StyleSheet } from "react-native";

import { CaptureColors, Spacing } from "@/styles/theme";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    backgroundColor: CaptureColors.backdrop,
  },
  back: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: CaptureColors.control,
    borderWidth: 1,
    borderColor: CaptureColors.controlBorder,
  },
  pressed: { backgroundColor: CaptureColors.controlPressed },
  backIcon: { width: 22, height: 22 },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.three,
  },
  mascot: { width: 150, height: 150 },
  title: {
    color: CaptureColors.foreground,
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center",
  },
  body: {
    color: CaptureColors.muted,
    fontSize: 16,
    lineHeight: 23,
    textAlign: "center",
    maxWidth: 360,
  },
  action: { alignSelf: "stretch", marginTop: Spacing.two },
  error: {
    color: CaptureColors.danger,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
});
