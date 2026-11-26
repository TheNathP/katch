import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { AppState } from 'react-native';

import { progressionStore } from '@/data/demo-progression-store';
import { useSession } from '@/data/session-provider';
import { shiftDay, summarizeProgression, utcDay } from '@/lib/progression';

export function useProgression() {
  const { user } = useSession();
  const store = progressionStore(user?.id ?? 'guest');
  const snapshot = useSyncExternalStore(store.subscribe, store.snapshot, store.snapshot);
  const [today, setToday] = useState(utcDay);

  useEffect(() => { void store.load(); }, [store]);

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
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') syncDay();
    });
    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, []));

  return {
    summary: snapshot.data ? summarizeProgression(snapshot.data, today) : undefined,
    error: snapshot.error,
    busy: snapshot.busy,
    load: store.load,
    purchase: store.purchase,
  };
}
