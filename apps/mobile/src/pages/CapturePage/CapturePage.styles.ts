import { StyleSheet } from "react-native";

import { CaptureColors } from "@/styles/theme";

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: CaptureColors.panel },
  camera: { ...StyleSheet.absoluteFill },
});
