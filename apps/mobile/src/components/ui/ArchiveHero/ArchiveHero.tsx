import { Image, type ImageProps } from 'expo-image';
import { View } from 'react-native';
import Animated, { FadeIn, ReduceMotion } from 'react-native-reanimated';

import ThemedText from '@/components/ui/ThemedText';

import { styles } from './ArchiveHero.styles';

const fade = FadeIn.duration(220).reduceMotion(ReduceMotion.System);

export default function ArchiveHero({ title, detail, art, transitionKey }: {
  title: string;
  detail?: string;
  art: ImageProps['source'];
  transitionKey?: string;
}) {
  return (
    <View style={styles.hero}>
      <Animated.View key={transitionKey && transitionKey + '-art'} entering={transitionKey ? fade : undefined} style={styles.art}>
        <Image aria-hidden source={art} contentFit="contain" style={styles.mascot} />
      </Animated.View>
      <Animated.View key={transitionKey} entering={transitionKey ? fade : undefined} style={styles.copy}>
        <ThemedText accessibilityRole="header" style={styles.title}>{title}</ThemedText>
        {detail && <ThemedText type="smallBold" style={styles.detail}>{detail}</ThemedText>}
      </Animated.View>
    </View>
  );
}
