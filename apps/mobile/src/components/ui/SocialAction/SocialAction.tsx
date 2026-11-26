import { Pressable } from 'react-native';

import Icon, { type IconName } from '@/components/ui/Icon';
import ThemedText from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/use-theme';
import { socialStyles as styles } from '@/styles/social';
import { OnboardingColors } from '@/styles/theme';

type Props = {
  label: string;
  icon?: IconName;
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
        <Icon name={icon} size={20} color={accent ? OnboardingColors.ink : theme.text} />
      ) : (
        <ThemedText type="smallBold" style={accent && styles.friendsBadgeText}>{label}</ThemedText>
      )}
    </Pressable>
  );
}
