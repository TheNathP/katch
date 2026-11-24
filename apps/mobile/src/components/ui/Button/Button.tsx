import { Image, type ImageProps } from 'expo-image';
import type { ComponentPropsWithRef } from 'react';
import { Pressable, Text, type StyleProp, type ViewStyle } from 'react-native';

import { ButtonTokens } from '@/styles/theme';

import { styles } from './Button.styles';

type ButtonProps = Omit<ComponentPropsWithRef<typeof Pressable>, 'children' | 'style'> & {
  label: string;
  variant?: 'primarySolid';
  trailingIcon?: ImageProps['source'];
  style?: StyleProp<ViewStyle>;
};

export default function Button({
  label,
  variant = 'primarySolid',
  trailingIcon,
  accessibilityRole = 'button',
  accessibilityState,
  disabled = false,
  style,
  ...pressableProps
}: ButtonProps) {
  return (
    <Pressable
      {...pressableProps}
      accessibilityRole={accessibilityRole}
      accessibilityState={{ ...accessibilityState, disabled }}
      disabled={disabled}
      style={({ pressed }) => [
        styles[variant],
        style,
        disabled ? styles.disabled : pressed && styles.pressed,
      ]}>
      <Text style={styles.label}>{label}</Text>
      {trailingIcon != null && (
        <Image
          aria-hidden
          source={trailingIcon}
          style={styles.icon}
          loading="eager"
          contentFit="contain"
          tintColor={ButtonTokens.primarySolid.foreground}
        />
      )}
    </Pressable>
  );
}
