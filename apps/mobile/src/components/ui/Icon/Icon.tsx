import { Image, type ImageProps } from 'expo-image';

import { useTheme } from '@/hooks/use-theme';

const glyphs = {
  calendar: require('@/assets/icons/calendar.svg'),
  check: require('@/assets/icons/check.svg'),
  chevronRight: require('@/assets/icons/chevron-right.svg'),
  lock: require('@/assets/icons/lock.svg'),
  moreHorizontal: require('@/assets/icons/more-horizontal.svg'),
  xMark: require('@/assets/icons/x-mark.svg'),
} as const;

const artwork = {
  calendarIllustrated: require('@/assets/icon-illus/calendar.svg'),
  coin: require('@/assets/icon-illus/coin.png'),
  flame: require('@/assets/icon-illus/flame.png'),
  gift: require('@/assets/icon-illus/gift.png'),
  lockIllustrated: require('@/assets/icon-illus/lock.png'),
  sparkle: require('@/assets/icons/sparkle.svg'),
  target: require('@/assets/icon-illus/target.png'),
  trophy: require('@/assets/icon-illus/trophy.png'),
  xp: require('@/assets/icons/badges/xp.svg'),
  xpIllustrated: require('@/assets/icon-illus/xp.svg'),
} as const;

const sources = { ...glyphs, ...artwork };
export type IconName = keyof typeof sources;

type Props = {
  name: IconName;
  size?: number;
  color?: string;
  label?: string;
  style?: ImageProps['style'];
};

export default function Icon({ name, size = 24, color, label, style }: Props) {
  const theme = useTheme();

  return (
    <Image
      source={sources[name]}
      aria-hidden={!label}
      accessibilityLabel={label}
      tintColor={name in glyphs ? color ?? theme.text : undefined}
      style={[{ width: size, height: size }, style]}
      contentFit="contain"
    />
  );
}
