import { StyleSheet } from 'react-native';

import { Spacing } from '@/styles/theme';

export const styles = StyleSheet.create({
  overlay: { flex: 1, paddingHorizontal: Spacing.four, alignItems: 'center', justifyContent: 'center' },
  backdrop: { ...StyleSheet.absoluteFill },
  card: { width: '100%', maxWidth: 440, maxHeight: '90%', borderRadius: 28, borderWidth: 1, overflow: 'hidden' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.two,
    paddingHorizontal: Spacing.three, paddingTop: Spacing.three, paddingBottom: Spacing.two,
  },
  identity: { flex: 1, alignItems: 'flex-start', gap: Spacing.one },
  title: { fontSize: 25, fontWeight: '900' },
  score: {
    overflow: 'hidden', borderRadius: 12, paddingHorizontal: Spacing.two, paddingVertical: Spacing.one,
    fontSize: 16, fontWeight: '900', fontVariant: ['tabular-nums'],
  },
  close: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  closeIcon: { width: 20, height: 20 },
  content: { gap: Spacing.three, paddingHorizontal: Spacing.three, paddingBottom: Spacing.three },
  photo: { width: '100%', aspectRatio: 4 / 3, borderRadius: 18 },
  photoMessage: { minHeight: 110, justifyContent: 'center', padding: Spacing.three, borderRadius: 18 },
  message: { textAlign: 'center', fontSize: 15, fontWeight: '600' },
});
