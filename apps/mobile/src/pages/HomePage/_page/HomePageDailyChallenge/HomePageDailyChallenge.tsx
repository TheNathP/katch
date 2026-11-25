import { Image } from 'expo-image';
import { router } from 'expo-router';
import type { ComponentRef, Ref } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

import Button from '@/components/ui/Button';
import type { DailyColor } from '@/data/adapters/daily-color.adapters';
import { useTheme } from '@/hooks/use-theme';
import HomePageChallengeCountdown from '@/pages/HomePage/_page/HomePageChallengeCountdown';
import HomePageChallengeVeil from '@/pages/HomePage/_page/HomePageChallengeVeil';

import { styles } from './HomePageDailyChallenge.styles';

const calendar = require('@/assets/icons/calendar.svg');
const camera = require('@/assets/icons/camera.svg');
const sparkle = require('@/assets/icons/sparkle.svg');

export type ChallengeState =
  | { status: 'loading' | 'error' }
  | { status: 'ready'; color: DailyColor; reveal: 'hidden' | 'saving' | 'revealing' | 'revealed'; revealError?: boolean };

type Props = {
  state: ChallengeState;
  onRetry: () => void;
  onReveal: () => void;
  revealProgress: SharedValue<number>;
  swatchRef: Ref<ComponentRef<typeof View>>;
};

export default function HomePageDailyChallenge({ state, onRetry, onReveal, revealProgress, swatchRef }: Props) {
  const theme = useTheme();
  const challenge = state.status === 'ready' ? state : undefined;
  const color = challenge?.color;
  const revealed = challenge?.reveal === 'revealed';
  const revealing = challenge?.reveal === 'revealing';

  return (
    <View style={[styles.card, {
      backgroundColor: theme.dailyCard,
      borderColor: theme.dailyBorder,
      boxShadow: theme.dailyShadow,
    }]}>
      <View style={styles.eyebrow}>
        <Image aria-hidden source={calendar} tintColor={theme.dailyAccent} style={styles.icon} />
        <Text accessibilityRole="header" style={[styles.eyebrowText, { color: theme.dailyAccent }]}>
          Défi du jour
        </Text>
      </View>
      <View style={[
        styles.colorArea,
        !color && [styles.colorPlaceholder, { backgroundColor: theme.dailySurface }],
      ]}>
        {color ? (
          <>
            <View ref={swatchRef} collapsable={false} aria-hidden style={[styles.swatch, {
              backgroundColor: revealed ? color.hex : theme.dailySurface,
              borderColor: theme.dailySwatchBorder,
            }]}>
              {!revealed && (
                <HomePageChallengeVeil
                  key={color.date}
                  color={color.hex}
                  idle={challenge?.reveal === 'hidden'}
                  revealing={revealing}
                  progress={revealProgress}
                />
              )}
            </View>
            <View style={[styles.colorDetails, !revealed && styles.countdownOnly]}>
              {revealed && (
                <Text
                  selectable
                  accessibilityLabel={`Code couleur ${color.hex}`}
                  accessibilityLiveRegion="polite"
                  style={[styles.hex, { color: theme.dailyMuted }]}>
                  {color.hex}
                </Text>
              )}
              <HomePageChallengeCountdown refreshAt={color.refreshAt} />
            </View>
          </>
        ) : state.status === 'loading' ? (
          <>
            <ActivityIndicator color={theme.dailyAccent} />
            <Text accessibilityLiveRegion="polite" style={[styles.stateText, { color: theme.dailyMuted }]}>
              Chargement de la couleur…
            </Text>
          </>
        ) : (
          <View style={styles.error}>
            <Text accessibilityLiveRegion="polite" style={[styles.stateText, { color: theme.dailyMuted }]}>
              La couleur est indisponible.
            </Text>
            <Pressable accessibilityRole="button" onPress={onRetry} style={styles.retry}>
              <Text style={[styles.retryText, { color: theme.dailyAccent }]}>Réessayer</Text>
            </Pressable>
          </View>
        )}
      </View>
      {challenge?.revealError && (
        <Text accessibilityLiveRegion="polite" style={[styles.stateText, { color: theme.dailyMuted }]}>
          Impossible de mémoriser le dévoilement. Réessaie.
        </Text>
      )}
      <Button
        accessibilityRole={revealed ? 'link' : 'button'}
        label={revealed ? 'Capturer ma couleur' : 'Dévoiler la couleur'}
        variant="limeSolid"
        leadingIcon={revealed ? camera : sparkle}
        disabled={!challenge || challenge.reveal === 'saving' || revealing}
        onPress={revealed ? () => router.navigate('/defi') : onReveal}
        style={styles.capture}
      />
    </View>
  );
}
