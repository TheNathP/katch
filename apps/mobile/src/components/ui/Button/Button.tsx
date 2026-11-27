import { Image, type ImageProps } from 'expo-image';
import type { ComponentPropsWithRef } from 'react';
import { Pressable, Text, type StyleProp, type ViewStyle } from 'react-native';

import Icon, { type IconName } from '@/components/ui/Icon';
import { useTheme } from '@/hooks/use-theme';
import { ButtonTokens } from '@/styles/theme';

import { styles } from './Button.styles';

type ButtonVariant =
  | { variant: 'ghost'; tone?: 'neutral' | 'muted' | 'danger' }
  | { variant?: keyof typeof ButtonTokens | 'outline'; tone?: never };

type ButtonProps = Omit<ComponentPropsWithRef<typeof Pressable>, 'children' | 'style'> & {
  label: string;
  busy?: boolean;
  size?: 'regular' | 'compact';
  leadingIcon?: ImageProps['source'];
  leadingIconName?: IconName;
  leadingIconSize?: number;
  trailingIcon?: ImageProps['source'];
  style?: StyleProp<ViewStyle>;
} & ButtonVariant;

export default function Button({
  label,
  variant = 'primarySolid',
  tone = 'neutral',
  busy = false,
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
  const unavailable = disabled || busy;
  const ghost = variant === 'ghost';
  const outlined = variant === 'outline';
  const filled = variant === 'primarySolid' || variant === 'limeSolid';
  const muted = compact && unavailable && !ghost;
  const ghostColor = tone === 'danger' ? theme.danger : tone === 'muted' ? theme.textSecondary : theme.dailyInk;
  const foreground = ghost ? ghostColor : muted ? theme.text : outlined ? theme.dailyInk : ButtonTokens[variant].foreground;

  return (
    <Pressable
      {...pressableProps}
      accessibilityRole={accessibilityRole}
      accessibilityState={{ ...accessibilityState, busy: busy || accessibilityState?.busy, disabled: unavailable }}
      disabled={unavailable}
      style={({ pressed }) => [
        styles.root,
        !muted && styles[variant],
        outlined && !muted && {
          borderColor: theme.dailyBorder,
          backgroundColor: pressed && !unavailable ? theme.dailySurface : theme.dailyCard,
        },
        style,
        compact && styles.compact,
        muted && [styles.compactDisabled, { backgroundColor: theme.dailySurface, borderColor: theme.dailyBorder }],
        unavailable && !muted && styles.disabled,
        pressed && !unavailable && (filled ? [styles.pressed, styles[`${variant}Pressed`]] : ghost && styles.ghostPressed),
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
      <Text style={[styles.label, compact && styles.compactLabel, ghost && styles.ghostLabel, { color: foreground }]}>{label}</Text>
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
