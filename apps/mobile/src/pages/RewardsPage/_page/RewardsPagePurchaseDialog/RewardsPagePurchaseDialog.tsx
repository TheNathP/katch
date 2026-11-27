import { Image, type ImageProps } from 'expo-image';
import { useEffect, useRef } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import ThemedText from '@/components/ui/ThemedText';
import { useTheme } from '@/hooks/use-theme';
import { formatNumber } from '@/lib/format-number';

import { styles } from './RewardsPagePurchaseDialog.styles';

type Props = {
  name: string;
  title: string;
  price: number;
  art: ImageProps['source'];
  artBackground: string;
  busy: boolean;
  error?: string;
  mode: 'purchase' | 'complete' | 'owned';
  equipped: boolean;
  onConfirm: () => Promise<void>;
  onClose: () => void;
};

export default function RewardsPagePurchaseDialog({
  name, title, price, art, artBackground, busy, error, mode, equipped, onConfirm, onClose,
}: Props) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const complete = mode === 'complete';
  const owned = mode === 'owned';
  const closing = useRef(false);
  const submitting = useRef(false);
  const visibility = useSharedValue(reduceMotion ? 1 : 0);
  const reveal = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) return;
    visibility.set(withTiming(1, { duration: 210, easing: Easing.out(Easing.cubic) }));
    return () => cancelAnimation(visibility);
  }, [reduceMotion, visibility]);

  useEffect(() => {
    if ((!complete && !owned) || reduceMotion) return;
    reveal.set(withDelay(85, withSequence(
      withTiming(1.12, { duration: 265, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 180, easing: Easing.out(Easing.quad) }),
    )));
    return () => cancelAnimation(reveal);
  }, [complete, owned, reduceMotion, reveal]);

  async function confirm() {
    if (closing.current || submitting.current || busy) return;
    submitting.current = true;
    try {
      await onConfirm();
    } finally {
      submitting.current = false;
    }
  }

  function close() {
    if (closing.current || submitting.current || busy) return;
    closing.current = true;
    if (reduceMotion) {
      onClose();
      return;
    }
    visibility.set(withTiming(0, { duration: 170, easing: Easing.in(Easing.quad) }, finished => {
      if (finished) scheduleOnRN(onClose);
    }));
  }

  const veil = useAnimatedStyle(() => ({ opacity: 0.7 * visibility.get() }));
  const panelMotion = useAnimatedStyle(() => ({
    opacity: visibility.get(),
    transform: [{ translateY: interpolate(visibility.get(), [0, 1], [16, 0]) }],
  }));
  const pixMotion = useAnimatedStyle(() => ({
    opacity: interpolate(reveal.get(), [0, 1, 1.12], [0, 1, 1]),
    transform: [
      { translateY: interpolate(reveal.get(), [0, 1], [20, 0]) },
      { scale: interpolate(reveal.get(), [0, 1], [0.74, 1]) },
    ],
  }));

  return (
    <Modal transparent statusBarTranslucent navigationBarTranslucent onRequestClose={close}>
      <View style={styles.viewport}>
        <Animated.View aria-hidden pointerEvents="none" style={[styles.scrim, veil]} />
        <ScrollView contentContainerStyle={styles.placement} bounces={false}>
          <Pressable
            aria-hidden
            accessible={false}
            focusable={false}
            onPress={close}
            style={styles.backdropTarget}
          />
          <Animated.View accessibilityViewIsModal style={[
            styles.panel, { backgroundColor: theme.dailyCard, borderColor: theme.dailyBorder }, panelMotion,
          ]}>
            {(complete || owned) && (
              <View aria-hidden style={[styles.stage, { backgroundColor: artBackground }]}>
                <Animated.View style={pixMotion}>
                  <Image source={art} style={styles.mascot} contentFit="contain" />
                </Animated.View>
              </View>
            )}
            <View style={styles.copy}>
              <ThemedText accessibilityRole="header" accessibilityLiveRegion="polite" style={styles.title}>
                {complete ? title : owned ? 'Personnaliser Pix' : 'Confirmer l’achat ?'}
              </ThemedText>
              <ThemedText type="smallBold" accessibilityLiveRegion="polite" style={styles.item}>{name}</ThemedText>
              {owned || complete ? (
                <ThemedText type="small" themeColor="textSecondary">
                  {equipped ? 'Équipé sur ton profil' : 'Dans tes accessoires'}
                </ThemedText>
              ) : (
                <View style={styles.price}>
                  <Icon name="coin" size={23} />
                  <ThemedText type="small" themeColor="textSecondary">{formatNumber(price)} KatchCoins</ThemedText>
                </View>
              )}
            </View>
            {!complete && error && (
              <ThemedText accessibilityLiveRegion="polite" type="small" themeColor="danger" style={styles.error}>
                {error}
              </ThemedText>
            )}
            {complete ? (
              <Button variant="limeSolid" label="Continuer" onPress={close} style={styles.action} />
            ) : (
              <View style={styles.actions}>
                <Pressable accessibilityRole="button" disabled={busy} onPress={close} style={styles.cancel}>
                  <ThemedText type="smallBold" themeColor="textSecondary">Annuler</ThemedText>
                </Pressable>
                <Button
                  variant="limeSolid"
                  size="compact"
                  label={owned ? (equipped ? 'Retirer' : 'Équiper') : 'Acheter'}
                  disabled={busy}
                  accessibilityState={{ busy }}
                  onPress={() => void confirm()}
                  style={styles.confirm}
                />
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </View>
    </Modal>
  );
}
