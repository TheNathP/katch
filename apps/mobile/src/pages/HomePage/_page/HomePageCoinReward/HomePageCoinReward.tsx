import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import CoinWallet, { walletLabel } from '@/components/ui/CoinWallet';
import Icon from '@/components/ui/Icon';
import ThemedText from '@/components/ui/ThemedText';
import { Spacing } from '@/styles/theme';

import { styles } from './HomePageCoinReward.styles';

const duration = 1580;
const screenSettle = 180;
const arrival = 0.83;
const rewardOffset = 66;
const flightOriginOffset = 20;
const coins = [
  { x: -72, fall: 46, start: 0.03, spin: -35, size: 23 },
  { x: -42, fall: 62, start: 0.09, spin: 24, size: 18 },
  { x: 62, fall: 48, start: 0.05, spin: 36, size: 25 },
  { x: 35, fall: 65, start: 0.12, spin: -29, size: 17 },
];

type Point = { x: number; y: number };

function FlyingCoin({ progress, target, top, x, fall, start, spin, size }:
  (typeof coins)[number] & { progress: SharedValue<number>; target: Point; top: number }) {
  const motion = useAnimatedStyle(() => {
    const t = progress.get() - start;
    const transfer = 0.58 - start / 2;
    const end = arrival - start;
    const fly = Easing.inOut(Easing.cubic)(interpolate(t, [transfer, end], [0, 1], Extrapolation.CLAMP));
    const drop = interpolate(t, [0, 0.25], [-42, fall], Extrapolation.CLAMP);
    return {
      opacity: interpolate(t, [0, 0.06, end - 0.06, end], [0, 1, 1, 0], Extrapolation.CLAMP),
      transform: [
        { translateX: x + (target.x - x) * fly },
        { translateY: drop + (target.y - flightOriginOffset - drop) * fly - 24 * Math.sin(Math.PI * fly) },
        { rotate: `${spin * (1 - 2 * fly)}deg` },
        { scale: 1 - 0.52 * fly },
      ],
    };
  });

  return (
    <Animated.View aria-hidden style={[styles.coin, { top: top - size / 2 }, motion]}>
      <Icon name="coin" size={size} />
    </Animated.View>
  );
}

type Props = {
  amount: number;
  balance?: number;
  previousBalance?: number;
  onFinish: () => void;
};

export default function HomePageCoinReward({ amount, balance, previousBalance, onFinish }: Props) {
  const { top, right } = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(0);
  const [walletWidth, setWalletWidth] = useState(68);
  const [settled, setSettled] = useState(amount === 0);
  const side = Math.max(right, (width - 480) / 2) + Spacing.three;
  const originY = top + Spacing.two + rewardOffset;
  const target = {
    x: width / 2 - side - walletWidth / 2,
    y: 22 - rewardOffset,
  };

  useEffect(() => {
    if (amount <= 0) return;
    const deposit = setTimeout(() => setSettled(true), reducedMotion ? 0 : screenSettle + duration * arrival);
    const finish = setTimeout(onFinish, screenSettle + duration);
    if (!reducedMotion) {
      progress.set(0);
      progress.set(withDelay(screenSettle, withTiming(1, { duration, easing: Easing.linear })));
    }
    return () => {
      clearTimeout(deposit);
      clearTimeout(finish);
      cancelAnimation(progress);
    };
  }, [amount, onFinish, progress, reducedMotion]);

  const pulse = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(progress.get(), [arrival - 0.04, arrival + 0.055, 1], [1, 1.14, 1], Extrapolation.CLAMP) }],
  }));
  const rewardMotion = useAnimatedStyle(() => {
    const t = progress.get();
    const fly = Easing.inOut(Easing.cubic)(interpolate(t, [0.61, arrival], [0, 1], Extrapolation.CLAMP));
    return {
      opacity: interpolate(t, [0, 0.12, arrival - 0.05, arrival], [0, 1, 1, 0], Extrapolation.CLAMP),
      transform: [
        { translateX: target.x * fly },
        { translateY: interpolate(t, [0, 0.19, 0.29], [-22, 3, 0], Extrapolation.CLAMP)
          + (target.y - 23) * fly },
        { scale: interpolate(t, [0, 0.19, 0.29], [0.88, 1.06, 1], Extrapolation.CLAMP) - 0.66 * fly },
      ],
    };
  });

  const displayedBalance = amount > 0 && !settled && !reducedMotion ? previousBalance : balance;
  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      {(balance !== undefined || amount > 0) && (
        <Animated.View
          style={[styles.wallet, { top: top + Spacing.two, right: side }, pulse]}
          onLayout={({ nativeEvent }) => setWalletWidth(nativeEvent.layout.width)}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={walletLabel(displayedBalance)}
            accessibilityHint="Ouvre les récompenses"
            onPress={() => router.navigate('/recompenses')}
            style={({ pressed }) => [styles.walletButton, pressed && styles.walletPressed]}>
            <CoinWallet balance={displayedBalance} interactive />
          </Pressable>
        </Animated.View>
      )}
      {amount > 0 && (
        <View pointerEvents="none" style={styles.overlay}>
          {!reducedMotion && coins.map(coin => (
            <FlyingCoin key={coin.x} {...coin} progress={progress} target={target} top={originY + flightOriginOffset} />
          ))}
          <Animated.View accessible accessibilityLabel={`${amount} KatchCoins gagnés avec ta photo`}
            accessibilityLiveRegion="polite"
            style={[styles.reward, { top: originY }, !reducedMotion && rewardMotion]}>
            <Icon name="coin" size={43} />
            <ThemedText aria-hidden style={styles.total}>+{amount}</ThemedText>
          </Animated.View>
        </View>
      )}
    </View>
  );
}
