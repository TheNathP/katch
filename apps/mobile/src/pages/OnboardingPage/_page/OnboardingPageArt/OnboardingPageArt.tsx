import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import { OnboardingColors as color } from '@/styles/theme';

import { styles } from './OnboardingPageArt.styles';

const running = require('@/assets/images/pix/running.png');
const amber = require('@/assets/images/pix/excited-amber.png');
const amethyst = require('@/assets/images/pix/star-eyes-amethyst.png');
const rose = require('@/assets/images/pix/happy-rose.png');
const excited = require('@/assets/images/pix/excited.png');
const happy = require('@/assets/images/pix/happy.png');
const ribbon = require('@/assets/icon-illus/decorations/onboarding-ribbon.svg');
const targetDrop = require('@/assets/icon-illus/decorations/onboarding-target-drop.svg');
const rewardsPath = require('@/assets/icon-illus/decorations/onboarding-rewards-path.svg');
const coin = require('@/assets/icon-illus/coin.png');
const trophy = require('@/assets/icon-illus/trophy.png');
const community = require('@/assets/icons/community.svg');

const players = [
  { name: 'Léo', pix: amber, shade: color.avatarAmber, badge: require('@/assets/icons/badges/rank-1.svg') },
  { name: 'Chloé', pix: rose, shade: color.avatarCoral, badge: require('@/assets/icons/badges/rank-2.svg') },
  { name: 'Max', pix: amethyst, shade: color.avatarAmethyst, badge: require('@/assets/icons/badges/rank-3.svg') },
] as const;

type Props = {
  scene: 'hunt' | 'ranking' | 'rewards' | 'trial' | 'result' | 'missed' | 'registration';
  height: number;
};

export default function OnboardingPageArt({ scene, height }: Props) {
  if (scene === 'hunt') {
    const size = height * 1.06;
    return (
      <View aria-hidden style={[styles.art, { height }]}>
        <Image source={ribbon} style={[styles.ribbon, { height: height * 1.12 }]} contentFit="fill" />
        <Image source={running} style={{ width: size, height: size }} contentFit="contain" />
      </View>
    );
  }

  if (scene === 'ranking') {
    return (
      <View aria-hidden style={[styles.art, { minHeight: height }]}>
        <View style={styles.leaderboard}>
          <View style={styles.rankingHeader}>
            <View style={styles.groupIcon}>
              <Image source={community} style={styles.smallIcon} contentFit="contain" tintColor={color.purple} />
            </View>
            <Text style={styles.rankingTitle}>Entre amis</Text>
          </View>
          {players.map(({ name, pix, shade, badge }, index) => (
            <View key={name} style={[styles.rankingRow, index === 0 && styles.winner]}>
              <Image source={badge} style={styles.rankIcon} contentFit="contain" />
              <View style={[styles.avatar, { backgroundColor: shade }]}>
                <Image source={pix} style={styles.avatarImage} contentFit="cover" />
              </View>
              <Text style={[styles.player, index === 0 && styles.winnerName]}>{name}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }

  if (scene === 'rewards') {
    return (
      <View aria-hidden style={[styles.art, { minHeight: height }]}>
        <View style={styles.rewardTrail}>
          <Image source={rewardsPath} style={styles.trailPath} contentFit="fill" />
          <View style={[styles.rewardStop, styles.coinStop]}>
            <View style={[styles.rewardMedal, styles.coinMedal]}>
              <Image source={coin} style={styles.rewardIcon} contentFit="contain" />
            </View>
            <Text style={styles.rewardLabel}>KatchCoins</Text>
          </View>
          <View style={[styles.rewardStop, styles.trophyStop]}>
            <View style={styles.rewardMedal}>
              <Image source={trophy} style={styles.rewardIcon} contentFit="contain" />
            </View>
            <Text style={styles.rewardLabel}>Badges</Text>
          </View>
          <View style={[styles.rewardStop, styles.pixStop]}>
            <View style={[styles.rewardMedal, styles.pixMedal]}>
              <Image source={amethyst} style={styles.rewardPix} contentFit="contain" />
            </View>
            <Text style={styles.rewardLabel}>Styles de Pix</Text>
          </View>
        </View>
      </View>
    );
  }

  if (scene === 'trial') {
    return (
      <View aria-hidden style={[styles.art, { minHeight: height * 0.82 }]}>
        <View style={styles.colorSample}>
          <Image
            source={targetDrop}
            style={styles.colorDrop}
            tintColor={color.target}
            contentFit="contain"
            loading="eager"
          />
          <View style={styles.colorLabel}>
            <View style={styles.colorSwatch} />
            <View>
              <Text style={styles.colorRole}>Couleur à retrouver</Text>
              <Text style={styles.colorName}>{color.target}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  const result = scene === 'result' || scene === 'missed';
  const mascotSize = height * (result ? 0.82 : 0.98);
  return (
    <View aria-hidden style={[styles.art, { height: result ? height * 0.79 : height }]}>
      <Image source={scene === 'result' ? excited : happy} style={{ width: mascotSize, height: mascotSize }} contentFit="contain" />
    </View>
  );
}
