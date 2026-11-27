import { StyleSheet } from 'react-native';

import { OnboardingColors, Spacing } from '@/styles/theme';

export const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFill, zIndex: 4 },
  wallet: { position: 'absolute' },
  walletButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  walletPressed: { opacity: 0.8 },
  reward: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    borderBottomWidth: 3,
    borderColor: OnboardingColors.purple,
    backgroundColor: OnboardingColors.avatarAmber,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    gap: Spacing.one,
    boxShadow: OnboardingColors.cardShadow,
  },
  total: { color: OnboardingColors.ink, fontSize: 22, lineHeight: 27, fontWeight: '900' },
  coin: { position: 'absolute', alignSelf: 'center' },
});
