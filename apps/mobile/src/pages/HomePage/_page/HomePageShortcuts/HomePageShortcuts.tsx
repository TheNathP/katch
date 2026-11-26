import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

import { styles } from './HomePageShortcuts.styles';

const chevron = require('@/assets/icons/chevron-right.svg');
const shortcuts = [
  { href: '/progression/serie', label: 'Ma série', icon: require('@/assets/icon-illus/flame.png') },
  { href: '/classement', label: 'Classement du jour', icon: require('@/assets/icon-illus/trophy.png') },
] as const;

export default function HomePageShortcuts() {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      {shortcuts.map(({ href, icon, label }) => (
        <Pressable
          key={href}
          accessibilityRole="link"
          onPress={() => router.navigate(href)}
          style={({ pressed }) => [
            styles.shortcut,
            {
              backgroundColor: pressed ? theme.dailySurface : theme.dailyCard,
              borderColor: theme.dailyBorder,
            },
          ]}>
          <Image aria-hidden source={icon} style={styles.icon} contentFit="contain" />
          <Text style={[styles.label, { color: theme.dailyInk }]}>{label}</Text>
          <Image aria-hidden source={chevron} style={styles.chevron} tintColor={theme.dailyMuted} />
        </Pressable>
      ))}
    </View>
  );
}
