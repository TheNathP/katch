import { StyleSheet } from 'react-native';

import { Spacing } from '@/styles/theme';

export const styles = StyleSheet.create({
  badge: {
    position: 'absolute', right: Spacing.one, bottom: Spacing.one,
    width: 44, height: 44, borderRadius: 22, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  pix: { width: 32, height: 32 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  heading: { flex: 1, fontWeight: '800', fontSize: 19, lineHeight: 24 },
  close: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.72 },
  sunk: { transform: [{ translateY: 2 }, { scale: 0.9 }] },
});
