import { useFocusEffect } from 'expo-router';
import { useCallback, useState, useSyncExternalStore } from 'react';
import { AppState } from 'react-native';

import { rewardsStore } from '@/data/rewards-store';
import { useSession } from '@/data/session-provider';
import { shiftDay, summarizeProgression, utcDay } from '@/lib/progression';

export function useProgression() {
  const { user } = useSession();
  const store = rewardsStore(user?.id);
  const snapshot = useSyncExternalStore(store.subscribe, store.snapshot, store.snapshot);
  const [today, setToday] = useState(utcDay);

  useFocusEffect(useCallback(() => {
    let timer: ReturnType<typeof setTimeout>;
    function syncDay() {
      clearTimeout(timer);
      const day = utcDay();
      setToday(day);
      const nextDay = Date.parse(`${shiftDay(day, 1)}T00:00:00Z`);
      timer = setTimeout(syncDay, Math.max(50, nextDay - Date.now()));
    }

    syncDay();
    void store.load();
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        syncDay();
        void store.load();
      }
    });
    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, [store]));

  return {
    summary: snapshot.data ? summarizeProgression(snapshot.data, today) : undefined,
    error: snapshot.error,
    busy: snapshot.busy,
    load: store.load,
    change: store.change,
    actionError: snapshot.actionError,
    clearActionError: store.clearActionError,
  };
}
