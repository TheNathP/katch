import { Image } from 'expo-image';
import { View } from 'react-native';

import { styles } from './HomePageHero.styles';

const pix = require('@/assets/images/pix/running.png');
const purpleBlob = require('@/assets/icon-illus/decorations/blob-purple.svg');
const yellowBlob = require('@/assets/icon-illus/decorations/blob-yellow.svg');

export default function HomePageHero() {
  return (
    <View aria-hidden pointerEvents="none" style={styles.artwork}>
      <Image source={purpleBlob} contentFit="contain" style={styles.purpleBlob} />
      <Image source={yellowBlob} contentFit="contain" style={styles.yellowBlob} />
      <Image source={pix} contentFit="contain" style={styles.pix} />
    </View>
  );
}
