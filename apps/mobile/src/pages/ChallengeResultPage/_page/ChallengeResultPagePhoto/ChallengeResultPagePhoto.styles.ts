import { StyleSheet } from "react-native";

import { CaptureColors } from "@/styles/theme";

export const styles = StyleSheet.create({
  frame: { width: "100%", borderRadius: 20, overflow: "hidden", backgroundColor: CaptureColors.backdrop },
  photo: { ...StyleSheet.absoluteFill },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: CaptureColors.scrim },
  scan: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 3,
    backgroundColor: CaptureColors.accent,
    boxShadow: CaptureColors.scanGlow,
  },
  ring: {
    position: "absolute",
    borderWidth: 3,
    borderColor: CaptureColors.accent,
    boxShadow: CaptureColors.markerShadow,
  },
  ripple: { position: "absolute", borderWidth: 2, borderColor: CaptureColors.accent },
  dot: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: CaptureColors.foreground,
  },
});
