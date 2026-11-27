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
  xpTrack: { flex: 1 },
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.two, marginBottom: Spacing.two },
  metric: { flex: 1, minWidth: 0, borderRadius: 20, alignItems: "center", padding: Spacing.two, gap: 2 },
  metricFull: { flexBasis: "100%" },
  metricArt: { width: 42, height: 42 },
  metricValue: { fontSize: 23, lineHeight: 25, fontWeight: "900" },
  metricPlaceholder: { width: 33, height: 15, marginVertical: 5, borderRadius: 6 },
  metricLabel: { textAlign: "center", fontSize: 12, lineHeight: 16 },
  collection: { marginBottom: Spacing.one },
  collectionLink: {
    flexDirection: "row", alignSelf: "flex-start", gap: Spacing.one,
    minHeight: 44, paddingVertical: 0, justifyContent: "center",
  },
  chevron: { width: 11, height: 14 },
  settingsButton: { width: 44, height: 44, marginRight: Spacing.two, alignItems: "center", justifyContent: "center" },
  settingsIcon: { width: 23, height: 23 },
  settingsPressed: { opacity: 0.6 },
});
