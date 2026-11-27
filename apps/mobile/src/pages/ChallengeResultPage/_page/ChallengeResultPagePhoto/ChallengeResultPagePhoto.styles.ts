import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  frame: {
    width: "100%",
    maxWidth: 660,
    overflow: "hidden",
  },
  photo: { ...StyleSheet.absoluteFill },
  ambientPhoto: { ...StyleSheet.absoluteFill, opacity: 0.26 },
  anchor: { position: "absolute" },
});
