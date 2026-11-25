import { StyleSheet } from 'react-native';

import { Spacing } from '@/styles/theme';

export const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.one, paddingRight: Spacing.two, borderRadius: 18, borderWidth: 1 },
  identity: { flex: 1, minHeight: 66, padding: Spacing.two, flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  pressed: { opacity: 0.65 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  avatarImage: { width: '100%', height: '100%' },
  name: { flex: 1, minWidth: 0 },
  chevron: { width: 16, height: 16 },
});
