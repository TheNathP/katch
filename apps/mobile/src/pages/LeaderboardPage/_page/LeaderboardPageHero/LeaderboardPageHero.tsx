import { Image } from 'expo-image';
import { View } from 'react-native';

import { styles } from './LeaderboardPageHero.styles';

const pix = require('@/assets/images/pix/happy.png');
const trophy = require('@/assets/icon-illus/trophy.png');
const purpleBlob = require('@/assets/icon-illus/decorations/blob-purple.svg');
const yellowBlob = require('@/assets/icon-illus/decorations/blob-yellow.svg');

export default function LeaderboardPageHero() {
  return (
    <View aria-hidden pointerEvents="none" style={styles.artwork}>
      <Image source={purpleBlob} contentFit="contain" style={styles.purpleBlob} />
      <Image source={yellowBlob} contentFit="contain" style={styles.yellowBlob} />
      <View style={styles.illustration}>
        <Image source={pix} contentFit="contain" style={styles.pix} />
        <Image source={trophy} contentFit="contain" style={styles.trophy} />
      </View>
    </View>
  );
}
