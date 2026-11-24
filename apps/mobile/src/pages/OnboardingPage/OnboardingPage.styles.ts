import { StyleSheet } from 'react-native';

import { ButtonTokens, ComicFeedbackColors, OnboardingColors as color, Spacing } from '@/styles/theme';

const maxPageWidth = 520;

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.canvas },
  header: {
    width: '100%',
    maxWidth: maxPageWidth,
    minHeight: 58,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
  },
  feedbackHeader: { zIndex: 2 },
  headerSide: { flex: 1 },
  backButton: {
    minWidth: 44, minHeight: 44, alignSelf: 'flex-start', alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { width: 18, height: 18 },
  coverEdges: { ...StyleSheet.absoluteFill, overflow: 'hidden' },
  purpleCorner: { position: 'absolute', right: -12, width: 145, height: 101 },
  limeLeft: { position: 'absolute', left: -12, width: 75, height: 138 },
  limeCorner: { position: 'absolute', right: -8, bottom: -10, width: 87, height: 98 },
  coverContent: { flexGrow: 1, gap: 6, paddingBottom: Spacing.two },
  wordmark: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end' },
  brand: {
    color: color.ink,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: -4.5,
    includeFontPadding: false,
    flexShrink: 0,
    overflow: 'visible',
  },
  brandDot: { borderRadius: 99, backgroundColor: color.lime, marginLeft: -2 },
  coverCaption: {
    textAlign: 'center',
    color: color.ink,
    fontSize: 20,
    lineHeight: 27,
    fontWeight: '700',
    paddingHorizontal: 18,
  },
  skipButton: {
    alignSelf: 'flex-end', minHeight: 44, minWidth: 56, paddingHorizontal: Spacing.two,
    alignItems: 'center', justifyContent: 'center',
  },
  skipText: { color: color.ink, fontSize: 14, fontWeight: '700' },
  feedbackSkipText: { color: ComicFeedbackColors.paper },
  feedbackOverlay: { ...StyleSheet.absoluteFill, zIndex: 1 },
  main: { flex: 1 },
  inactivePager: { opacity: 0 },
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: color.canvas },
  pager: { flex: 1, alignSelf: 'center' },
  slideContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    gap: 10,
  },
  slideAction: { marginTop: Spacing.three, minHeight: ButtonTokens.primarySolid.minHeight, width: '100%', maxWidth: 344, alignSelf: 'center' },
  scrollContent: {
    flexGrow: 1, width: '100%', maxWidth: maxPageWidth, alignSelf: 'center',
    paddingHorizontal: Spacing.four, paddingBottom: Spacing.three, gap: Spacing.four,
  },
  stage: { flex: 1, justifyContent: 'center', gap: Spacing.two, paddingTop: Spacing.two },
  title: {
    textAlign: 'center', color: color.ink, fontSize: 35, lineHeight: 39, letterSpacing: -1.25,
    fontWeight: '900',
  },
  titleAccent: { color: color.purple },
  description: {
    alignSelf: 'center', maxWidth: 310, textAlign: 'center', color: color.muted,
    fontSize: 16, lineHeight: 23, fontWeight: '500',
  },
  footer: { gap: Spacing.two },
  secondary: {
    minHeight: 48, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.three,
  },
  secondaryText: { color: color.purple, fontSize: 16, fontWeight: '800', textAlign: 'center' },
  pressed: { opacity: 0.65 },
});
