import { router, type Href } from 'expo-router';
import { Pressable } from 'react-native';

import Icon, { type IconName } from '@/components/ui/Icon';
import ThemedText from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/use-theme';

import { styles } from './IconLink.styles';

type Props = { href: Href; label: string; icon?: IconName; variant?: 'card' | 'plain' };

export default function IconLink({ href, label, icon, variant = 'card' }: Props) {
  const theme = useTheme();
  const plain = variant === 'plain';

  return (
    <Pressable
      accessibilityRole="link"
      onPress={() => router.navigate(href)}
      style={({ pressed }) => [
        plain
          ? [styles.plain, pressed && styles.plainPressed]
          : [styles.link, { backgroundColor: pressed ? theme.dailySurface : theme.dailyCard, borderColor: theme.dailyBorder }],
      ]}>
      {icon && <Icon name={icon} size={31} />}
      <ThemedText type="smallBold" style={plain ? { color: theme.dailyAccent } : styles.label}>{label}</ThemedText>
      <Icon name="chevronRight" size={15} color={plain ? theme.dailyAccent : theme.textSecondary} />
    </Pressable>
  );
}
