import { StyleSheet } from 'react-native';

import { Spacing } from '@/styles/theme';

export const styles = StyleSheet.create({
  screen: { flex: 1 },
  list: { paddingHorizontal: Spacing.four, paddingBottom: Spacing.four },
  separator: { height: Spacing.two },
  footerSpacing: { marginTop: Spacing.two },
  message: { padding: Spacing.three, borderRadius: 20, borderWidth: 1, gap: Spacing.three },
  messageText: { textAlign: 'center', fontSize: 15, fontWeight: '600' },
});
