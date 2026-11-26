import { StyleSheet } from "react-native";

import { CaptureColors } from "@/styles/theme";

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: CaptureColors.panel },
  layer: { flex: 1 },
  topBar: { ...StyleSheet.absoluteFill },
  camera: { ...StyleSheet.absoluteFill },
  previewCover: {
    ...StyleSheet.absoluteFill,
    backgroundColor: CaptureColors.backdrop,
  },
});
