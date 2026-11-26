import { Image, type ImageProps } from 'expo-image';
import type { ComponentPropsWithRef } from 'react';
import { Pressable, Text, type StyleProp, type ViewStyle } from 'react-native';

import Icon, { type IconName } from '@/components/ui/Icon';
import { useTheme } from '@/hooks/use-theme';
import { ButtonTokens } from '@/styles/theme';

import { styles } from './Button.styles';

type ButtonProps = Omit<ComponentPropsWithRef<typeof Pressable>, 'children' | 'style'> & {
  label: string;
  variant?: keyof typeof ButtonTokens;
  size?: 'regular' | 'compact';
  leadingIcon?: ImageProps['source'];
  leadingIconName?: IconName;
  leadingIconSize?: number;
  trailingIcon?: ImageProps['source'];
  style?: StyleProp<ViewStyle>;
};

export default function Button({
  label,
  variant = 'primarySolid',
  size = 'regular',
  leadingIcon,
  leadingIconName,
  leadingIconSize,
  trailingIcon,
  accessibilityRole = 'button',
  accessibilityState,
  disabled = false,
  style,
  ...pressableProps
}: ButtonProps) {
  const theme = useTheme();
  const customIconDimensions = leadingIconSize == null ? undefined : { width: leadingIconSize, height: leadingIconSize };
  const compact = size === 'compact';
  const muted = compact && disabled;
  const foreground = muted ? theme.text : ButtonTokens[variant].foreground;

  return (
    <Pressable
      {...pressableProps}
      accessibilityRole={accessibilityRole}
      accessibilityState={{ ...accessibilityState, disabled }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.root,
        !muted && styles[variant],
        style,
        compact && styles.compact,
        muted && [styles.compactDisabled, { backgroundColor: theme.dailySurface, borderColor: theme.dailyBorder }],
        disabled && !muted && styles.disabled,
        !disabled && pressed && [styles.pressed, styles[`${variant}Pressed`]],
      ]}>
      {leadingIconName ? (
        <Icon name={leadingIconName} size={leadingIconSize ?? (compact ? 20 : 18)} color={foreground} />
      ) : leadingIcon != null && (
        <Image
          aria-hidden
          source={leadingIcon}
          style={[styles.icon, customIconDimensions]}
          contentFit="contain"
          tintColor={foreground}
        />
      )}
      <Text style={[styles.label, compact && styles.compactLabel, { color: foreground }]}>{label}</Text>
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
