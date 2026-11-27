import { StyleSheet } from 'react-native';

import { ComicFeedbackColors, OnboardingColors, Spacing } from '@/styles/theme';

export const styles = StyleSheet.create({
  hero: {
    borderRadius: 28,
    minHeight: 168,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    backgroundColor: ComicFeedbackColors.validated.background,
    backgroundImage: OnboardingColors.rankingHighlight,
    padding: Spacing.three,
  },
  copy: { maxWidth: '63%', gap: Spacing.two, alignItems: 'flex-start' },
  title: {
    color: OnboardingColors.white,
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 37,
    letterSpacing: -1.35,
  },
  detail: {
    color: OnboardingColors.ink,
    backgroundColor: OnboardingColors.lime,
    paddingHorizontal: 10,
    paddingVertical: Spacing.one,
    borderRadius: 14,
    overflow: 'hidden',
  },
  art: { position: 'absolute', right: 1, bottom: 13, width: '38%', height: 126 },
  mascot: { width: '100%', height: '100%' },
});
