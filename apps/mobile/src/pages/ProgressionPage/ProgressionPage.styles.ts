import { StyleSheet } from 'react-native';

import { OnboardingColors, Spacing } from '@/styles/theme';

export const styles = StyleSheet.create({
  stats: { flexDirection: 'row', gap: Spacing.two },
  stat: { flex: 1, minWidth: 0, borderRadius: 20 },
  statArt: { height: 65, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  challengeArt: { backgroundColor: OnboardingColors.avatarAmethyst },
  streakArt: { backgroundColor: OnboardingColors.avatarAmber },
  statCopy: { gap: Spacing.half, alignItems: 'center', padding: Spacing.two },
  statValue: { fontSize: 22, lineHeight: 27, fontWeight: '900', textAlign: 'center' },
  statLabel: { textAlign: 'center' },
});
