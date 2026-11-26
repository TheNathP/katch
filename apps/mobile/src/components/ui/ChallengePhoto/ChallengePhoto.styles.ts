import { StyleSheet } from 'react-native';

import { Spacing } from '@/styles/theme';

export const styles = StyleSheet.create({
  photo: { overflow: 'hidden', borderRadius: 18, borderWidth: 1 },
  fill: { ...StyleSheet.absoluteFill },
  fallback: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.two },
  icon: { width: 25, height: 25 },
  color: { ...StyleSheet.absoluteFill, opacity: 0.16 },
});
