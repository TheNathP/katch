import type { EquippedRewards } from '@/data/api.types';

import { OnboardingColors } from './theme';

export const rewardArt = {
  original: { source: require('@/assets/icon-illus/shop/pix-original.svg'), tint: OnboardingColors.lavender },
  aqua: { source: require('@/assets/icon-illus/shop/pix-aqua.svg'), tint: OnboardingColors.avatarAmethyst },
  spark: { source: require('@/assets/icon-illus/shop/pix-spark.svg'), tint: OnboardingColors.lilac },
  rose: { source: require('@/assets/images/pix/happy-rose.png'), tint: OnboardingColors.avatarCoral },
  amber: { source: require('@/assets/images/pix/excited-amber.png'), tint: OnboardingColors.avatarAmber },
  amethyst: { source: require('@/assets/images/pix/star-eyes-amethyst.png'), tint: OnboardingColors.avatarAmethyst },
  purpleWave: { source: require('@/assets/icon-illus/shop/purple-wave.svg'), tint: OnboardingColors.lavender },
  limeFrame: { source: require('@/assets/icon-illus/shop/lime-frame.svg'), tint: OnboardingColors.avatarAmber },
};

const mascots = new Map<string, { source: number }>([
  ['original', rewardArt.original],
  ['aqua', rewardArt.aqua],
  ['spark', rewardArt.spark],
  ['rose', rewardArt.rose],
  ['ambre', rewardArt.amber],
  ['amethyste', rewardArt.amethyst],
]);

export function rewardAvatarAppearance(equipped?: EquippedRewards) {
  return {
    imageSource: equipped?.mascots ? mascots.get(equipped.mascots)?.source : undefined,
    backgroundSource: equipped?.backgrounds === 'purple-wave' ? rewardArt.purpleWave.source : undefined,
    frameColor: equipped?.frames === 'lime-frame' ? OnboardingColors.lime : undefined,
  };
}
