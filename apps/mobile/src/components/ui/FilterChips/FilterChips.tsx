import { Pressable, ScrollView } from 'react-native';

import ThemedText from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/use-theme';

import { styles } from './FilterChips.styles';

type Props<Value extends string> = {
  options: readonly { value: Value; label: string }[];
  value: Value;
  onChange: (value: Value) => void;
  label: string;
};

export default function FilterChips<Value extends string>({ options, value, onChange, label }: Props<Value>) {
  const theme = useTheme();

  return (
    <ScrollView
      horizontal
      accessibilityLabel={label}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}>
      {options.map(option => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.chip, { backgroundColor: theme.dailySurface }, selected && styles.selected, pressed && styles.pressed,
            ]}>
            <ThemedText style={[styles.label, selected && styles.selectedLabel]}>{option.label}</ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
