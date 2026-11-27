import { router, useIsFocused } from 'expo-router';
import type { ComponentRef, Ref } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

import Button from '@/components/ui/Button';
import Skeleton, { SkeletonBlock } from '@/components/ui/Skeleton';
import Icon from '@/components/ui/Icon';
import type { DailyColor, DailySubmission } from '@/data/adapters/daily-color.adapters';
import { useTheme } from '@/hooks/use-theme';
import HomePageChallengeCountdown from '@/pages/HomePage/_page/HomePageChallengeCountdown';
import HomePageChallengeVeil from '@/pages/HomePage/_page/HomePageChallengeVeil';
import HomePageDailyScore from '@/pages/HomePage/_page/HomePageDailyScore';

import { styles } from './HomePageDailyChallenge.styles';

const camera = require('@/assets/icons/camera.svg');
const sparkle = require('@/assets/icons/sparkle.svg');

export type ChallengeState =
  | { status: 'loading' | 'error' }
  | { status: 'cached'; color: DailyColor }
  | {
    status: 'ready';
    color: DailyColor;
    submission: DailySubmission | null;
    reveal: 'hidden' | 'saving' | 'revealing' | 'revealed';
    revealError?: boolean;
  };

type Props = {
  state: ChallengeState;
  onRetry: () => void;
  onReveal: () => void;
  revealProgress: SharedValue<number>;
  swatchRef: Ref<ComponentRef<typeof View>>;
};

export default function HomePageDailyChallenge({ state, onRetry, onReveal, revealProgress, swatchRef }: Props) {
  const theme = useTheme();
  const isFocused = useIsFocused();
  const challenge = state.status === 'ready' ? state : undefined;
  const previous = state.status === 'cached';
  const color = previous ? state.color : challenge?.color;
  const revealed = previous || challenge?.reveal === 'revealed';
  const revealing = challenge?.reveal === 'revealing';
  // A `cached` color belongs to a finished day, so its score is not shown.
  const submission = challenge?.reveal === 'revealed' ? challenge.submission : null;

  return (
    <View style={[styles.card, {
      backgroundColor: theme.dailyCard,
      borderColor: theme.dailyBorder,
      boxShadow: theme.dailyShadow,
    }]}>
      <View style={styles.eyebrow}>
        <Icon name="calendar" size={17} color={theme.dailyAccent} />
        <Text accessibilityRole="header" style={[styles.eyebrowText, { color: theme.dailyAccent }]}>
          {previous ? 'Dernière couleur enregistrée' : 'Défi du jour'}
        </Text>
      </View>
      <View style={[
        styles.colorArea,
        state.status === 'error' && [styles.colorPlaceholder, { backgroundColor: theme.dailySurface }],
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
                  idle={isFocused && challenge?.reveal === 'hidden'}
                  revealing={false}
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
              {!previous && <HomePageChallengeCountdown refreshAt={color.refreshAt} />}
            </View>
          </>
        ) : state.status === 'loading' ? (
          <Skeleton label="Chargement de la couleur">
            <View style={styles.loading}>
              <SkeletonBlock style={styles.swatchPlaceholder} />
              <SkeletonBlock style={styles.countdownPlaceholder} />
            </View>
          </Skeleton>
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
      {submission && <HomePageDailyScore submission={submission} />}
      {challenge?.revealError && (
        <Text accessibilityLiveRegion="polite" style={[styles.stateText, { color: theme.dailyMuted }]}>
          Impossible de mémoriser le dévoilement. Réessaie.
        </Text>
      )}
      <Button
        accessibilityRole={challenge?.reveal === 'revealed' ? 'link' : 'button'}
        label={previous
          ? 'Actualiser'
          : !revealed ? 'Dévoiler la couleur' : submission ? 'Reprendre une photo' : 'Capturer ma couleur'}
        variant="limeSolid"
        leadingIcon={previous ? undefined : revealed ? camera : sparkle}
        accessibilityHint={submission ? 'Ta nouvelle photo remplacera ton score du jour' : undefined}
        disabled={!previous && (!challenge || challenge.reveal === 'saving' || revealing)}
        onPress={previous ? onRetry : revealed ? () => router.navigate('/defi') : onReveal}
        style={styles.capture}
      />
    </View>
  );
}
