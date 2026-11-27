import { StyleSheet } from "react-native";

import { Spacing } from "@/styles/theme";

export const styles = StyleSheet.create({
  root: { flex: 1 },
  analysis: { flex: 1, justifyContent: "center", alignItems: "center", padding: Spacing.three },
  analysisFrame: {
    width: "100%", maxWidth: 460, flex: 1, maxHeight: 620,
    borderRadius: 27, overflow: "hidden",
    borderWidth: 1,
  },
  screen: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  content: { flex: 1, gap: Spacing.two, paddingTop: Spacing.four },
  title: { fontSize: 28, fontWeight: "900" },
  subtitle: { fontSize: 16, lineHeight: 22 },
  photoCard: {
    flex: 1,
    marginTop: Spacing.three,
    marginBottom: Spacing.four,
    overflow: "hidden",
    borderRadius: 28,
    borderWidth: 1,
  },
  photo: { ...StyleSheet.absoluteFill },
  error: { fontSize: 15, fontWeight: '600', textAlign: 'center', marginBottom: Spacing.three },
  actions: { flexDirection: "row", gap: 12, paddingBottom: Spacing.three },
  secondary: { flex: 1 },
  primary: { flex: 1.3 },
});
