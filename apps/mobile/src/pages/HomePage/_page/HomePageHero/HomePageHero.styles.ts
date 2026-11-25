import { StyleSheet } from 'react-native';

import { OnboardingColors, Spacing } from '@/styles/theme';

export const styles = StyleSheet.create({
  hero: { width: '100%', alignItems: 'center' },
  brand: {
    minHeight: 53,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.one,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.two,
  },
  avatarImage: { width: 42, height: 42 },
  wordmark: {
    fontSize: 27,
    fontStyle: 'italic',
    fontWeight: '900',
    letterSpacing: -1.25,
    paddingRight: Spacing.one,
  },
  brandDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: OnboardingColors.lime,
    transform: [{ translateY: 7 }],
  },
  artwork: {
    width: '100%',
    height: 184,
    alignItems: 'center',
    justifyContent: 'center',
  },
  purpleBlob: {
    position: 'absolute',
    left: -69,
    bottom: -20,
    width: 244,
    height: 138,
    transform: [{ rotate: '-19deg' }],
    opacity: 0.73,
  },
  yellowBlob: {
    position: 'absolute',
    right: -64,
    top: -16,
    width: 191,
    height: 116,
    transform: [{ rotate: '-18deg' }],
    opacity: 0.83,
  },
  pix: { width: 208, height: 208, transform: [{ translateY: 3 }] },
});
