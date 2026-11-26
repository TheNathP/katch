import { StyleSheet } from 'react-native';

import { Spacing } from '@/styles/theme';

export const styles = StyleSheet.create({
  link: {
    minHeight: 58, borderRadius: 16, borderWidth: 1, paddingHorizontal: 12, paddingVertical: Spacing.two,
    flexDirection: 'row', alignItems: 'center', gap: Spacing.two,
  },
  plain: {
    alignSelf: 'center', minHeight: 44, paddingHorizontal: Spacing.two,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing.one,
  },
  plainPressed: { opacity: 0.65 },
  label: { flex: 1, minWidth: 0 },
});
