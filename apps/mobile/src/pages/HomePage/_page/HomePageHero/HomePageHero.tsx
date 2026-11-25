import { Image } from 'expo-image';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';
import { styles as pageStyles } from '@/pages/HomePage/HomePage.styles';

import { styles } from './HomePageHero.styles';

const pix = require('@/assets/images/pix/running.png');
const avatar = require('@/assets/images/pix/happy.png');
const purpleBlob = require('@/assets/icon-illus/decorations/blob-purple.svg');
const yellowBlob = require('@/assets/icon-illus/decorations/blob-yellow.svg');

export default function HomePageHero() {
  const theme = useTheme();

  return (
    <View style={styles.hero}>
      <SafeAreaView edges={['left', 'right']} style={pageStyles.content}>
        <View accessible accessibilityLabel="Katch" style={styles.brand}>
          <View style={[styles.avatar, { backgroundColor: theme.dailySurface }]}>
            <Image source={avatar} contentFit="contain" style={styles.avatarImage} />
          </View>
          <Text style={[styles.wordmark, { color: theme.dailyInk }]}>KATCH</Text>
          <View style={styles.brandDot} />
        </View>
      </SafeAreaView>
      <View aria-hidden pointerEvents="none" style={styles.artwork}>
        <Image source={purpleBlob} contentFit="contain" style={styles.purpleBlob} />
        <Image source={yellowBlob} contentFit="contain" style={styles.yellowBlob} />
        <Image source={pix} contentFit="contain" style={styles.pix} />
      </View>
    </View>
  );
}
