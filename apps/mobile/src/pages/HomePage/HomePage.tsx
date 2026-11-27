import { useFocusEffect } from 'expo-router';
import { type ComponentRef, useCallback, useRef, useState } from 'react';
import { AppState, ScrollView, type View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { DailyChallenge } from '@/data/adapters/daily-color.adapters';
import { takePhotoCoins, type PhotoCoinReward } from '@/data/challenge-attempt';
import { getCachedDailyChallenge } from '@/data/daily-color-cache';
import { isDailyColorRevealed, rememberDailyColorReveal } from '@/data/daily-color-reveal';
import { getHomePage } from '@/data/get-home-page';
import { useSession } from '@/data/session-provider';
import { useProgression } from '@/hooks/use-progression';
import { useTheme } from '@/hooks/use-theme';

import HomePageCoinReward from './_page/HomePageCoinReward';
import HomePageDailyChallenge, { type ChallengeState } from './_page/HomePageDailyChallenge';
import HomePageHero from './_page/HomePageHero';
import HomePageRevealEffect from './_page/HomePageRevealEffect';
import HomePageShortcuts from './_page/HomePageShortcuts';
import { styles } from './HomePage.styles';

export default function HomePage() {
  const theme = useTheme();
  const accountId = useSession().user?.id;
  const { summary } = useProgression();
  const [photoReward, setPhotoReward] = useState<PhotoCoinReward>();
  const dismissPhotoCoins = useCallback(() => setPhotoReward(undefined), []);

  useFocusEffect(useCallback(() => {
    if (!accountId) return;
    const reward = takePhotoCoins(accountId);
    if (reward) setPhotoReward(reward);
    return dismissPhotoCoins;
  }, [accountId, dismissPhotoCoins]));
  const [challenge, setChallenge] = useState<ChallengeState>({ status: 'loading' });
  const reload = useRef<(() => Promise<void>) | null>(null);
  const knownChallenge = useRef<DailyChallenge | null>(null);
  const revealWrite = useRef<Promise<void> | null>(null);
  const swatchRef = useRef<ComponentRef<typeof View>>(null);
  const revealProgress = useSharedValue(0);
  const revealingColor = challenge.status === 'ready' && challenge.reveal === 'revealing'
    ? challenge.color
    : undefined;

  useFocusEffect(useCallback(() => {
    const currentAccountId = accountId;
    if (!currentAccountId) return;
    const controller = new AbortController();
    let pending = false;
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;

    async function displayChallenge(daily: DailyChallenge) {
      if (controller.signal.aborted) return;
      clearTimeout(refreshTimer);
      knownChallenge.current = daily;
      const { color, submission } = daily;

      if (color.refreshAt <= performance.now()) {
        setChallenge({ status: 'cached', color });
        return;
      }

      await revealWrite.current?.catch(() => {});
      const revealed = submission !== null || await isDailyColorRevealed(color.date).catch(() => false);
      if (controller.signal.aborted) return;
      const remainingMs = color.refreshAt - performance.now();
      if (remainingMs <= 0) {
        setChallenge({ status: 'cached', color });
        return;
      }

      setChallenge((current) => current.status === 'ready' && current.color.date === color.date
        ? { ...current, color, submission, reveal: submission && current.reveal === 'hidden' ? 'revealed' : current.reveal }
        : { status: 'ready', color, submission, reveal: revealed ? 'revealed' : 'hidden' });
      refreshTimer = setTimeout(() => {
        setChallenge({ status: 'cached', color });
        void loadChallenge();
      }, remainingMs);
    }

    const loadChallenge = async () => {
      if (pending || controller.signal.aborted) return;
      pending = true;
      setChallenge((current) => current.status === 'error' ? { status: 'loading' } : current);

      try {
        const stored = await getCachedDailyChallenge(currentAccountId);
        const known = knownChallenge.current;
        const cached = stored && (!known || stored.color.date >= known.color.date) ? stored : known;
        if (cached) await displayChallenge(cached);
        if (controller.signal.aborted) return;

        await displayChallenge(await getHomePage(currentAccountId));
      } catch {
        if (!controller.signal.aborted && !knownChallenge.current) setChallenge({ status: 'error' });
      } finally {
        pending = false;
      }
    };

    reload.current = loadChallenge;
    void loadChallenge();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void loadChallenge();
    });

    return () => {
      reload.current = null;
      controller.abort();
      clearTimeout(refreshTimer);
      subscription.remove();
    };
  }, [accountId]));

  const revealColor = async () => {
    if (challenge.status !== 'ready' || challenge.reveal !== 'hidden' || revealWrite.current) return;
    if (challenge.color.refreshAt <= performance.now()) {
      void reload.current?.();
      return;
    }

    const { date } = challenge.color;
    const write = rememberDailyColorReveal(date);
    revealWrite.current = write;
    setChallenge({ ...challenge, reveal: 'saving', revealError: false });

    let revealError = false;
    try {
      await write;
    } catch {
      revealError = true;
    } finally {
      revealWrite.current = null;
    }
    setChallenge((current) => current.status === 'ready' && current.color.date === date && current.reveal === 'saving'
      ? { ...current, reveal: revealError ? 'hidden' : 'revealing', revealError }
      : current);
  };

  const finishReveal = useCallback((date: string) => {
    setChallenge((current) => current.status === 'ready' && current.color.date === date && current.reveal === 'revealing'
      ? { ...current, reveal: 'revealed' }
      : current);
  }, []);

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: theme.dailyCanvas }]}>
      <ScrollView scrollEnabled={!revealingColor} contentContainerStyle={styles.scrollContent}>
        <HomePageHero />
        <SafeAreaView edges={['left', 'right']} style={styles.content}>
          <HomePageDailyChallenge
            state={challenge}
            onRetry={() => void reload.current?.()}
            onReveal={() => void revealColor()}
            revealProgress={revealProgress}
            swatchRef={swatchRef}
          />
          <HomePageShortcuts />
        </SafeAreaView>
      </ScrollView>
      <HomePageCoinReward
        key={photoReward ? 'deposit' : 'wallet'}
        amount={photoReward?.amount ?? 0}
        balance={summary?.coins}
        previousBalance={photoReward?.previousBalance}
        onFinish={dismissPhotoCoins}
      />
      {revealingColor && (
        <HomePageRevealEffect
          date={revealingColor.date}
          color={revealingColor.hex}
          progress={revealProgress}
          swatchRef={swatchRef}
          onComplete={finishReveal}
        />
      )}
    </SafeAreaView>
  );
}
