import { TextInput, View, type TextInputProps } from 'react-native';

import ThemedText from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/use-theme';

import { styles } from './TextField.styles';

type TextFieldProps = Omit<TextInputProps, 'style'> & {
  label: string;
};

export default function TextField({ label, ...inputProps }: TextFieldProps) {
  const theme = useTheme();

  return (
    <View style={styles.field}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={theme.textSecondary}
        style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
        {...inputProps}
      />
    </View>
  );
}
