import { Image, type ImageProps } from 'expo-image';
import { View } from 'react-native';

import Icon, { type IconName } from '@/components/ui/Icon';
import ThemedText from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/use-theme';
import { Colors } from '@/styles/theme';

import { styles } from './IllustratedBanner.styles';

const accent = require('@/assets/icon-illus/decorations/rewards-banner.svg');

type Props = {
  title: string;
  detail: string;
  art: { source: ImageProps['source']; scale?: number } | { icon: IconName };
};

export default function IllustratedBanner({ title, detail, art }: Props) {
  const theme = useTheme();

  return (
    <View style={styles.banner}>
      <Image
        aria-hidden
        source={accent}
        style={[styles.accent, theme === Colors.dark && styles.accentDark]}
        contentFit="fill"
      />
      <View aria-hidden style={styles.art}>
        {'icon' in art
          ? <Icon name={art.icon} size={152} style={styles.artIcon} />
          : (
            <Image
              aria-hidden
              source={art.source}
              style={[styles.image, art.scale === undefined ? undefined : { transform: [{ scale: art.scale }] }]}
              contentFit="contain"
            />
          )}
      </View>
      <View style={styles.copy}>
        <ThemedText accessibilityRole="header" style={[styles.title, { color: theme.dailyInk }]}>{title}</ThemedText>
        <ThemedText type="small" style={[styles.detail, { color: theme.dailyInk }]}>{detail}</ThemedText>
      </View>
    </View>
  );
}
