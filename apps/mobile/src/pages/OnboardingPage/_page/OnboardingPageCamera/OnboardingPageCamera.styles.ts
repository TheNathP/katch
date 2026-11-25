import { StyleSheet } from 'react-native';

import { OnboardingColors as color, Spacing } from '@/styles/theme';

export const styles = StyleSheet.create({
  content: { gap: Spacing.three, alignItems: 'center' },
  title: { color: color.ink, fontSize: 31, fontWeight: '900', letterSpacing: -1, textAlign: 'center' },
  target: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.two, backgroundColor: color.card,
    borderRadius: 14, paddingVertical: Spacing.two, paddingHorizontal: 12,
  },
  swatch: { width: 24, height: 24, borderRadius: 7, backgroundColor: color.target },
  targetText: { color: color.ink, fontSize: 15, fontWeight: '800' },
  preview: {
    width: '100%', maxWidth: 420, aspectRatio: 1.16, overflow: 'hidden', borderRadius: 22,
    backgroundColor: color.ink, justifyContent: 'center', alignItems: 'center',
  },
  camera: { ...StyleSheet.absoluteFill },
  guide: { width: '62%', aspectRatio: 1 },
  corner: { position: 'absolute', width: 24, height: 24, borderColor: color.white },
  topLeft: { top: 0, left: 0, borderLeftWidth: 4, borderTopWidth: 4, borderTopLeftRadius: 10 },
  topRight: { top: 0, right: 0, borderRightWidth: 4, borderTopWidth: 4, borderTopRightRadius: 10 },
  bottomLeft: { bottom: 0, left: 0, borderLeftWidth: 4, borderBottomWidth: 4, borderBottomLeftRadius: 10 },
  bottomRight: { bottom: 0, right: 0, borderRightWidth: 4, borderBottomWidth: 4, borderBottomRightRadius: 10 },
  shutter: {
    height: 70, width: 70, borderRadius: 35, borderWidth: 3, borderColor: color.limeShade,
    alignItems: 'center', justifyContent: 'center',
  },
  shutterCenter: { height: 54, width: 54, borderRadius: 27, backgroundColor: color.lime },
  dimmed: { opacity: 0.45 },
  permissionCard: {
    width: '100%', gap: 14, padding: Spacing.four, alignItems: 'center',
    backgroundColor: color.lavender, borderRadius: 24,
  },
  message: { color: color.muted, fontSize: 16, lineHeight: 23, textAlign: 'center' },
  permissionButton: { width: '100%' },
});
