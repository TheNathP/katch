import { StyleSheet } from "react-native";

import { CaptureColors } from "@/styles/theme";

const CORNER = 46;
const CORNER_WIDTH = 5;

export const styles = StyleSheet.create({
  viewfinder: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: CaptureColors.backdrop,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
  frame: {
    width: "78%",
    maxWidth: 380,
    aspectRatio: 0.82,
    alignItems: "center",
    justifyContent: "center",
  },
  corner: {
    position: "absolute",
    width: CORNER,
    height: CORNER,
    borderColor: CaptureColors.guide,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderLeftWidth: CORNER_WIDTH,
    borderTopWidth: CORNER_WIDTH,
    borderTopLeftRadius: 18,
  },
  topRight: {
    top: 0,
    right: 0,
    borderRightWidth: CORNER_WIDTH,
    borderTopWidth: CORNER_WIDTH,
    borderTopRightRadius: 18,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderLeftWidth: CORNER_WIDTH,
    borderBottomWidth: CORNER_WIDTH,
    borderBottomLeftRadius: 18,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderRightWidth: CORNER_WIDTH,
    borderBottomWidth: CORNER_WIDTH,
    borderBottomRightRadius: 18,
  },
  ring: { transform: [{ rotate: "-30deg" }] },
  mascot: {
    position: "absolute",
    left: -18,
    bottom: -34,
    width: 150,
    height: 150,
    transform: [{ rotate: "12deg" }],
  },
});
