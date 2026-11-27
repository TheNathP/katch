import { StyleSheet } from 'react-native';

import { Spacing } from '@/styles/theme';

export const styles = StyleSheet.create({
  card: { width: '48.5%', borderWidth: 1, borderRadius: 18, padding: Spacing.one, gap: Spacing.one },
  wide: { width: '100%' },
  caption: {
    flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
    gap: Spacing.one, paddingHorizontal: Spacing.one,
  },
  date: { flexShrink: 1 },
  score: { overflow: 'hidden', borderRadius: 99, paddingHorizontal: Spacing.one, paddingVertical: 2 },
  photo: { width: '100%', aspectRatio: 1.35, borderRadius: 13 },
  photoPlaceholder: { justifyContent: 'center', alignItems: 'center', gap: Spacing.one, padding: Spacing.one },
  placeholderLabel: { textAlign: 'center' },
  previewPanel: { maxWidth: 440, borderRadius: 26, padding: Spacing.three, gap: Spacing.two },
  previewHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.one },
  previewInfo: { flex: 1, alignItems: 'flex-start', gap: Spacing.one },
  previewTitle: { fontWeight: '800', fontSize: 19, lineHeight: 24 },
  closePreview: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  fullPhoto: { width: '100%', aspectRatio: 1, borderRadius: 17 },
  pressed: { opacity: 0.72 },
});
