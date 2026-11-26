import { StyleSheet } from 'react-native';

import { ButtonTokens, Spacing } from '@/styles/theme';

export const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row', borderRadius: 24, padding: Spacing.one, gap: Spacing.one,
    marginHorizontal: Spacing.four, marginBottom: Spacing.three,
  },
  tab: {
    flex: 1, minHeight: 44, padding: Spacing.two,
    alignItems: 'center', justifyContent: 'center', borderRadius: 22,
  },
  selectedTab: {
    backgroundColor: ButtonTokens.limeSolid.background,
    experimental_backgroundImage: ButtonTokens.limeSolid.gradient,
  },
  tabLabel: { fontSize: 15, fontWeight: '800', textAlign: 'center' },
});
