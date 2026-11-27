import { StyleSheet } from 'react-native';

import { Spacing } from '@/styles/theme';

export const styles = StyleSheet.create({
  row: {
    minHeight: 68, flexDirection: 'row', alignItems: 'center',
    padding: Spacing.two, gap: Spacing.two, borderRadius: 18, borderWidth: 1,
  },
  result: { minHeight: 57, paddingHorizontal: Spacing.three, borderRadius: 14 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  lines: { flex: 1, minWidth: 0, gap: 6 },
  name: { height: 12, width: '70%', maxWidth: 160, borderRadius: 6 },
  shortName: { width: '54%' },
  detail: { height: 8, width: '43%', maxWidth: 92, borderRadius: 4 },
  action: { width: 53, height: 32, borderRadius: 12 },
  score: { width: 48, height: 24, borderRadius: 12 },
  profile: {
    minHeight: 224, borderRadius: 28, borderWidth: 1, padding: Spacing.three,
    alignItems: 'center', justifyContent: 'center', gap: Spacing.two,
  },
  profileName: { width: '42%', height: 28, borderRadius: 10 },
  profileAvatar: { width: 105, height: 105, borderRadius: 53 },
  profileStatus: { width: 98, height: 26, borderRadius: 13 },
  profileSubtitle: { width: 136, height: 15, marginTop: Spacing.two, marginBottom: 6, borderRadius: 7 },
});
