import { StyleSheet } from "react-native";

import { CaptureColors, Spacing } from "@/styles/theme";

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: CaptureColors.backdrop,
    paddingHorizontal: Spacing.four,
  },
  content: { flex: 1, gap: Spacing.two, paddingTop: Spacing.four },
  title: { color: CaptureColors.foreground, fontSize: 28, fontWeight: "900" },
  subtitle: { color: CaptureColors.muted, fontSize: 16, lineHeight: 22 },
  photoCard: {
    flex: 1,
    marginTop: Spacing.three,
    marginBottom: Spacing.four,
    overflow: "hidden",
    borderRadius: 28,
    backgroundColor: CaptureColors.panel,
    borderWidth: 1,
    borderColor: CaptureColors.controlBorder,
  },
  photo: { ...StyleSheet.absoluteFill },
  analyzing: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CaptureColors.control,
  },
  error: { color: CaptureColors.danger, fontSize: 15, fontWeight: '600', textAlign: 'center', marginBottom: Spacing.three },
  actions: { flexDirection: "row", gap: 12, paddingBottom: Spacing.three },
  secondary: {
    flex: 1,
    minHeight: 54,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    backgroundColor: CaptureColors.panel,
    borderWidth: 1,
    borderColor: CaptureColors.controlBorder,
  },
  secondaryPressed: { backgroundColor: CaptureColors.controlPressed },
  secondaryIcon: { width: 20, height: 20 },
  secondaryLabel: {
    color: CaptureColors.foreground,
    fontSize: 17,
    fontWeight: "800",
  },
  primary: { flex: 1.3 },
});
