import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  circle: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  backgroundImage: { position: "absolute", width: "145%", height: "135%" },
  frame: { ...StyleSheet.absoluteFill },
  image: {
    width: "86%",
    height: "86%",
  },
});
