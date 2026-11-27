import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { ButtonTokens, OnboardingColors } from '@/styles/theme';

import { styles } from './SegmentedTabs.styles';

type Props<Value extends string> = {
  label: string;
  options: readonly { value: Value; label: string }[];
  value: Value;
  onChange: (value: Value) => void;
  variant?: 'solid' | 'gradient';
  style?: StyleProp<ViewStyle>;
};

export default function SegmentedTabs<Value extends string>({
  label, options, value, onChange, variant = 'solid', style,
}: Props<Value>) {
  const theme = useTheme();
  const gradient = variant === 'gradient';
  const selectedColor = gradient ? ButtonTokens.limeSolid.foreground : OnboardingColors.ink;

  return (
    <View accessibilityRole="tablist" accessibilityLabel={label} style={[styles.track, { backgroundColor: theme.dailySurface }, style]}>
      {options.map(option => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => { if (!selected) onChange(option.value); }}
            style={({ pressed }) => [
              styles.tab,
              gradient && styles.gradientTab,
              selected && (gradient ? styles.gradientSelection : styles.solidSelection),
              pressed && !selected && styles.pressed,
            ]}>
            <Text style={[gradient ? styles.gradientLabel : styles.label, { color: selected ? selectedColor : theme.dailyMuted }]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
