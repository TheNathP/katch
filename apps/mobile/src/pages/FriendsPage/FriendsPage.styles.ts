import { StyleSheet } from 'react-native';

import { OnboardingColors, Spacing } from '@/styles/theme';

export const styles = StyleSheet.create({
  friendsHero: {
    minHeight: 224, padding: Spacing.three, borderRadius: 28, borderWidth: 1,
    borderColor: OnboardingColors.track, backgroundColor: OnboardingColors.lavender,
    justifyContent: 'center', overflow: 'hidden',
  },
  friendsCopy: { maxWidth: '53%', gap: Spacing.two, alignItems: 'flex-start' },
  friendsTitle: { color: OnboardingColors.ink, fontSize: 38, lineHeight: 41, fontWeight: '900', letterSpacing: -1.5 },
  friendsBadge: {
    alignSelf: 'flex-start', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4,
    backgroundColor: OnboardingColors.lime,
  },
  friendsBadgeSlot: { minHeight: 28, justifyContent: 'center' },
  friendsBadgeSkeleton: { width: 55, height: 24, borderRadius: 12, backgroundColor: OnboardingColors.track },
  friendsPix: { position: 'absolute', right: -8, bottom: 17, width: '62%', height: '79%' },
  friendsCorner: { position: 'absolute', right: -16, top: -13, width: 151, height: 111 },
  friendsRibbon: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 68 },
  emptyFriends: { paddingTop: Spacing.three, paddingBottom: Spacing.four, alignItems: 'center', gap: Spacing.two },
  emptyAvatars: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  emptySeat: { width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, borderStyle: 'dashed', borderColor: OnboardingColors.lilac },
  emptyPixFrame: { width: 54, height: 54, borderRadius: 27, backgroundColor: OnboardingColors.lavender },
  emptyPix: { width: '100%', height: '100%' },
  emptyFriendsText: { textAlign: 'center' },
  requestActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one },
});
