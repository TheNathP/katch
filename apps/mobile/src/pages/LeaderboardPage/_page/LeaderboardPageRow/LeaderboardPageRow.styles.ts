import { StyleSheet } from 'react-native';

import { ButtonTokens, Spacing } from '@/styles/theme';

export const styles = StyleSheet.create({
  row: {
    borderWidth: 1, borderRadius: 20, minHeight: 64,
    paddingVertical: Spacing.two, paddingHorizontal: 12, gap: Spacing.two,
    flexDirection: 'row', alignItems: 'center',
  },
  pressed: { opacity: 0.75 },
  rank: { minWidth: 26, alignItems: 'center' },
  rankText: { fontSize: 13, fontWeight: '800', fontVariant: ['tabular-nums'] },
  crown: { width: 26, height: 26 },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  initial: { fontSize: 16, fontWeight: '800' },
  player: { flex: 1, gap: Spacing.one, alignItems: 'flex-start' },
  name: { maxWidth: '100%', fontSize: 15, fontWeight: '800' },
  ownLabel: {
    overflow: 'hidden', paddingHorizontal: Spacing.two, paddingVertical: Spacing.half, borderRadius: 9,
    backgroundColor: ButtonTokens.limeSolid.background, color: ButtonTokens.limeSolid.foreground,
    fontSize: 11, fontWeight: '800',
  },
  score: { flexShrink: 1, fontSize: 15, fontWeight: '900', fontVariant: ['tabular-nums'], textAlign: 'right' },
});
