import { Image, type ImageProps } from 'expo-image';
import { Pressable } from 'react-native';

import ThemedText from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/use-theme';
import { socialStyles as styles } from '@/styles/social';
import { OnboardingColors } from '@/styles/theme';

type Props = {
  label: string;
  icon?: ImageProps['source'];
  accessibilityLabel?: string;
  disabled?: boolean;
  quiet?: boolean;
  accent?: boolean;
  onPress: () => void;
};

export default function SocialAction({ label, icon, accessibilityLabel, disabled, quiet, accent, onPress }: Props) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.action, icon != null && styles.iconAction, !quiet && { backgroundColor: accent ? OnboardingColors.lime : theme.backgroundSelected },
        pressed && styles.pressed, disabled && styles.disabled,
      ]}>
      {icon != null ? (
        <Image source={icon} aria-hidden style={styles.actionIcon}
          tintColor={accent ? OnboardingColors.ink : theme.text} contentFit="contain" />
      ) : (
        <ThemedText type="smallBold" style={accent && styles.friendsBadgeText}>{label}</ThemedText>
      )}
    </Pressable>
  );
}
