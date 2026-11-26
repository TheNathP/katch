import { StyleSheet } from "react-native";

import { CaptureColors, Fonts, Spacing } from "@/styles/theme";

export const PILL_HEIGHT = 48;
export const PILL_MAX_WIDTH = 176;
/** Room kept on each side of the pill for the back and flash buttons of the top bar. */
export const PILL_SIDE_SPACE = Spacing.four + 48 + Spacing.two;

export const styles = StyleSheet.create({
  layer: { ...StyleSheet.absoluteFill },
  panel: {
    position: "absolute",
    overflow: "hidden",
    borderWidth: 1,
  },
  pressable: { ...StyleSheet.absoluteFill },
  pill: {
    ...StyleSheet.absoluteFill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: CaptureColors.foreground,
  },
  pillLabel: {
    color: CaptureColors.foreground,
    fontSize: 15,
    fontWeight: "800",
    flexShrink: 1,
  },
  expanded: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    padding: Spacing.four,
  },
  eyebrow: { fontSize: 18, fontWeight: "800" },
  hex: {
    fontSize: 40,
    fontWeight: "900",
    fontFamily: Fonts.mono,
    letterSpacing: 1,
  },
  hint: {
    fontSize: 15,
    fontWeight: "600",
    opacity: 0.8,
    marginTop: Spacing.three,
  },
});
