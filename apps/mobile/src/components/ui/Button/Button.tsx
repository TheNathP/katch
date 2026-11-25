import { ActivityIndicator, Pressable } from 'react-native';

import ThemedText from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/use-theme';

import { styles } from './Button.styles';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  disabled?: boolean;
};

export default function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
}: ButtonProps) {
  const theme = useTheme();
  const isPrimary = variant === 'primary';
  const textColor = isPrimary ? theme.onPrimary : theme.text;
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: isPrimary
            ? pressed
              ? theme.primaryPressed
              : theme.primary
            : pressed
              ? theme.backgroundSelected
              : theme.backgroundElement,
        },
        isDisabled && styles.disabled,
      ]}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <ThemedText type="smallBold" style={{ color: textColor }}>
          {label}
        </ThemedText>
      )}
    </Pressable>
  );
}
