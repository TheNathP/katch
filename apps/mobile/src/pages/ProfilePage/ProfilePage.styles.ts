import { StyleSheet } from "react-native";

import { Spacing } from "@/styles/theme";

export const styles = StyleSheet.create({
  header: {
    alignSelf: "center",
    alignItems: "center",
    gap: Spacing.two,
  },
  name: {
    textAlign: "center",
  },
  pressed: {
    opacity: 0.8,
  },
});
