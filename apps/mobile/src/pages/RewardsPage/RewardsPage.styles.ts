import { StyleSheet } from 'react-native';

import { Spacing } from '@/styles/theme';

export const styles = StyleSheet.create({
  headerTitle: { fontWeight: '900' },
  wallet: { marginRight: Spacing.three, marginBottom: Spacing.half },
  shop: { gap: Spacing.three },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  item: { borderRadius: 19 },
  itemThird: { width: '31.7%' },
  itemHalf: { width: '48.5%' },
  itemPressed: { transform: [{ scale: 0.97 }], opacity: 0.9 },
  artWell: { height: 104, borderRadius: 18, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  art: { width: '100%', maxWidth: 120, height: 98 },
  itemFooter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: Spacing.one, minHeight: 44, paddingHorizontal: Spacing.one, paddingVertical: Spacing.one,
  },
  price: { flexShrink: 1, fontWeight: '900', fontVariant: ['tabular-nums'] },
});
