import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Text } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

import { styles } from './HomePageChallengeCountdown.styles';

const second = 1_000;

export default function HomePageChallengeCountdown({ refreshAt }: { refreshAt: number }) {
  const theme = useTheme();
  const [secondsLeft, setSecondsLeft] = useState(() => Math.max(0, Math.ceil((refreshAt - performance.now()) / second)));

  useFocusEffect(useCallback(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const tick = () => {
      const remainingMs = Math.max(0, refreshAt - performance.now());
      setSecondsLeft(Math.ceil(remainingMs / second));

      if (remainingMs > 0) {
        timer = setTimeout(tick, remainingMs % second || second);
      }
    };

    tick();
    return () => clearTimeout(timer);
  }, [refreshAt]));

  const hours = Math.floor(secondsLeft / 3_600);
  const minutes = String(Math.floor(secondsLeft / 60) % 60).padStart(2, '0');
  const seconds = String(secondsLeft % 60).padStart(2, '0');

  return (
    <Text style={[styles.countdown, { color: theme.dailyMuted }]}>
      Change dans {hours} h {minutes} min {seconds} s
    </Text>
  );
}
