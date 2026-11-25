import { Image, type ImageProps } from 'expo-image';
import type { ComponentPropsWithRef } from 'react';
import { Pressable, Text, type StyleProp, type ViewStyle } from 'react-native';

import { ButtonTokens } from '@/styles/theme';

import { styles } from './Button.styles';

type ButtonProps = Omit<ComponentPropsWithRef<typeof Pressable>, 'children' | 'style'> & {
  label: string;
  variant?: keyof typeof ButtonTokens;
  leadingIcon?: ImageProps['source'];
  trailingIcon?: ImageProps['source'];
  style?: StyleProp<ViewStyle>;
};

export default function Button({
  label,
  variant = 'primarySolid',
  leadingIcon,
  trailingIcon,
  accessibilityRole = 'button',
  accessibilityState,
  disabled = false,
  style,
  ...pressableProps
}: ButtonProps) {
  const foreground = ButtonTokens[variant].foreground;

  return (
    <Pressable
      {...pressableProps}
      accessibilityRole={accessibilityRole}
      accessibilityState={{ ...accessibilityState, disabled }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.root,
        styles[variant],
        style,
        disabled && styles.disabled,
        !disabled && pressed && [styles.pressed, styles[`${variant}Pressed`]],
      ]}>
      {leadingIcon != null && (
        <Image aria-hidden source={leadingIcon} style={styles.icon} contentFit="contain" tintColor={foreground} />
      )}
      <Text style={[styles.label, { color: foreground }]}>{label}</Text>
      {trailingIcon != null && (
        <Image
          aria-hidden
          source={trailingIcon}
          style={styles.icon}
          loading="eager"
          contentFit="contain"
          tintColor={foreground}
        />
      )}
    </Pressable>
  );
}
