import { StyleSheet } from 'react-native';

import { MaxContentWidth, Spacing } from '@/styles/theme';

export const styles = StyleSheet.create({
  content: { width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', padding: Spacing.three, paddingBottom: Spacing.four },
  header: { gap: Spacing.three, marginBottom: 10 },
  row: { columnGap: '2%' },
  rowSeparator: { height: Spacing.two },
  footer: { gap: Spacing.three, marginTop: Spacing.three },
  center: { textAlign: 'center' },
});
