import { StyleSheet } from "react-native";

import { OnboardingColors, Spacing } from "@/styles/theme";

export const styles = StyleSheet.create({
  headerTitle: { fontWeight: "900" },
  hero: {
    alignItems: "center", gap: Spacing.two, paddingTop: Spacing.one, paddingBottom: Spacing.three,
    marginHorizontal: -Spacing.three, paddingHorizontal: Spacing.three,
  },
  crest: { ...StyleSheet.absoluteFill },
  crestDark: { opacity: 0.44 },
  avatarWrap: { marginBottom: Spacing.one },
  editLink: {
    position: "absolute", right: -9, bottom: -2, width: 43, height: 43,
    paddingVertical: 0, borderRadius: 22, borderWidth: 3, justifyContent: "center", backgroundColor: OnboardingColors.lime,
  },
  pencil: { width: 20, height: 20 },
  name: { textAlign: "center", fontSize: 29, lineHeight: 34, fontWeight: "900", letterSpacing: -0.7 },
  namePlaceholder: { width: 145, maxWidth: "75%", height: 34, borderRadius: 9 },
  identityError: { alignItems: "center" },
  retry: { minHeight: 44, justifyContent: "center" },
  experience: { width: "75%", maxWidth: 340, alignItems: "center", gap: Spacing.two },
  xpRow: { width: "100%", flexDirection: "row", alignItems: "center", gap: Spacing.one },
  xpTrack: { flex: 1, height: 11, borderWidth: 1, borderRadius: 6, boxShadow: OnboardingColors.scoreTrackShadow },
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.two, marginBottom: Spacing.two },
  metric: { flex: 1, minWidth: 0, borderRadius: 20, alignItems: "center", padding: Spacing.two, gap: 2 },
  metricFull: { flexBasis: "100%" },
  metricArt: { width: 42, height: 42 },
  metricValue: { fontSize: 23, lineHeight: 25, fontWeight: "900" },
  metricLabel: { textAlign: "center", fontSize: 12, lineHeight: 16 },
  collection: { marginBottom: Spacing.one },
  collectionLink: {
    flexDirection: "row", alignSelf: "flex-start", gap: Spacing.one,
    minHeight: 44, paddingVertical: 0, justifyContent: "center",
  },
  chevron: { width: 11, height: 14 },
  shortcuts: { gap: Spacing.two },
  shortcutGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.two },
  shortcut: {
    flex: 1, minWidth: 0, minHeight: 57, alignSelf: "stretch", alignItems: "center",
    flexDirection: "row", borderRadius: 17, borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.two, paddingVertical: Spacing.two, gap: Spacing.two,
  },
  shortcutFull: { flexBasis: "100%" },
  shortcutIcon: { width: 33, height: 33, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  shortcutArt: { width: 22, height: 22 },
  shortcutIllustration: { width: "100%", height: "100%" },
  shortcutLabel: { flex: 1, minWidth: 0, fontWeight: "800", fontSize: 13, lineHeight: 17 },
  historyLink: {
    alignSelf: "stretch", flexDirection: "row", minHeight: 51, gap: Spacing.two,
    paddingVertical: Spacing.one, paddingHorizontal: 10, borderRadius: 16,
  },
  historyArt: { width: 30, height: 34 },
  historyLabel: { flex: 1, fontWeight: "800" },

  settingsButton: { width: 44, height: 44, marginRight: Spacing.two, alignItems: "center", justifyContent: "center" },
  settingsIcon: { width: 23, height: 23 },
  settingsPressed: { opacity: 0.6 },
});
