import { StyleSheet } from 'react-native';

import { ButtonTokens, Spacing } from '@/styles/theme';

const { primarySolid, limeSolid } = ButtonTokens;

export const styles = StyleSheet.create({
  root: {
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    paddingHorizontal: Spacing.three,
    paddingVertical: 11,
  },
  primarySolid: {
    minHeight: primarySolid.minHeight,
    borderWidth: 1,
    borderColor: primarySolid.border,
    borderBottomWidth: 4,
    borderBottomColor: primarySolid.base,
    backgroundColor: primarySolid.background,
    backgroundImage: primarySolid.gradient,
    boxShadow: primarySolid.shadow,
  },
  limeSolid: {
    minHeight: limeSolid.minHeight,
    borderWidth: 1,
    borderColor: limeSolid.border,
    borderBottomWidth: 4,
    borderBottomColor: limeSolid.base,
    backgroundColor: limeSolid.background,
    backgroundImage: limeSolid.gradient,
    boxShadow: limeSolid.shadow,
  },
  outline: {
    minHeight: primarySolid.minHeight,
    borderWidth: 1,
    paddingHorizontal: Spacing.two,
  },
  ghost: { minHeight: 44, paddingHorizontal: 12, paddingVertical: 4 },
  ghostLabel: { fontSize: 14, lineHeight: 20, fontWeight: '700' },
  ghostPressed: { opacity: 0.65 },
  compact: { minHeight: 44, borderRadius: 12, gap: 5, paddingHorizontal: Spacing.two, paddingVertical: 4 },
  compactDisabled: { borderWidth: 1 },
  compactLabel: { fontSize: 14 },
  pressed: {
    transform: [{ translateY: 1 }],
  },
  primarySolidPressed: {
    backgroundImage: primarySolid.pressedGradient,
    backgroundColor: primarySolid.pressedBackground,
    boxShadow: primarySolid.pressedShadow,
  },
  limeSolidPressed: {
    backgroundImage: limeSolid.pressedGradient,
    backgroundColor: limeSolid.pressedBackground,
    boxShadow: limeSolid.pressedShadow,
  },
  disabled: { opacity: 0.55 },
  label: {
    flexShrink: 1,
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  icon: { width: 18, height: 18, flexShrink: 0 },
});
