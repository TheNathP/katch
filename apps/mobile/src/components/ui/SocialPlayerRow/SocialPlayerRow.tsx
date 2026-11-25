import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import ThemedText from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/use-theme';
import { OnboardingColors } from '@/styles/theme';

import { styles } from './SocialPlayerRow.styles';

const avatars = [
  [require('@/assets/images/pix/confident-aqua.png'), OnboardingColors.lavender],
  [require('@/assets/images/pix/happy-rose.png'), OnboardingColors.avatarCoral],
  [require('@/assets/images/pix/excited-amber.png'), OnboardingColors.avatarAmber],
  [require('@/assets/images/pix/star-eyes-amethyst.png'), OnboardingColors.avatarAmethyst],
] as const;
const chevron = require('@/assets/icons/chevron-right.svg');

export function getSocialAvatar(id: string) {
  const seed = Number.parseInt(id.slice(-4), 16);
  return avatars[(seed || 0) % avatars.length];
}

type Props = {
  player: { id: string; name: string };
  subtitle?: string;
  trailing?: ReactNode;
  onOpen?: () => void;
};

export default function SocialPlayerRow({ player, subtitle, trailing, onOpen }: Props) {
  const theme = useTheme();
  const [image, color] = getSocialAvatar(player.id);
  const identity = (
    <>
      <View style={[styles.avatar, { backgroundColor: color }]}>
        <Image source={image} aria-hidden style={styles.avatarImage} contentFit="contain" />
      </View>
      <View style={styles.name}>
        <ThemedText type="smallBold">{player.name}</ThemedText>
        {subtitle && <ThemedText type="small" themeColor="textSecondary">{subtitle}</ThemedText>}
      </View>
    </>
  );

  return (
    <View style={[styles.row, { backgroundColor: theme.tabBarBackground, borderColor: theme.tabBarBorder }]}>
      {onOpen ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Voir le profil de ${player.name}`}
          onPress={onOpen}
          style={({ pressed }) => [styles.identity, pressed && styles.pressed]}>
          {identity}
          {!trailing && (
            <Image source={chevron} aria-hidden style={styles.chevron} tintColor={theme.textSecondary} />
          )}
        </Pressable>
      ) : (
        <View style={styles.identity}>{identity}</View>
      )}
      {trailing}
    </View>
  );
}
