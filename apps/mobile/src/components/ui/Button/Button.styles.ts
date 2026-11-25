import { StyleSheet } from 'react-native';

import { ButtonTokens, Spacing } from '@/styles/theme';

const { primarySolid } = ButtonTokens;

export const styles = StyleSheet.create({
  primarySolid: {
    minHeight: primarySolid.minHeight,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: primarySolid.border,
    borderBottomWidth: 4,
    borderBottomColor: primarySolid.base,
    backgroundColor: primarySolid.background,
    backgroundImage: primarySolid.gradient,
    boxShadow: primarySolid.shadow,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    paddingHorizontal: Spacing.three,
    paddingVertical: 11,
  },
  pressed: {
    transform: [{ translateY: 1 }],
    backgroundImage: primarySolid.pressedGradient,
    backgroundColor: primarySolid.pressedBackground,
    boxShadow: primarySolid.pressedShadow,
  },
  disabled: { opacity: 0.55 },
  label: {
    color: primarySolid.foreground,
    flexShrink: 1,
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  icon: { width: 18, height: 18, flexShrink: 0 },
});
