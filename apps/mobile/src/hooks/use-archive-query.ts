import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { useSession } from '@/data/session-provider';

type Snapshot<T> = { key: string; data?: T; error: boolean; loading: boolean };
const maxRememberedQueries = 3;

export function useArchiveQuery<T>(
  scope: string,
  load: (signal: AbortSignal) => Promise<T>,
  { enabled = true, reuseForMs = 0, reloadWhenActive = false }: {
    enabled?: boolean;
    reuseForMs?: number;
    reloadWhenActive?: boolean;
  } = {},
) {
  const { user } = useSession();
  const userId = user?.id;
  const key = userId + '/' + scope;
  const request = useRef<AbortController | null>(null);
  const remembered = useRef(new Map<string, { data: T; loadedAt: number }>());
  const [snapshot, setSnapshot] = useState<Snapshot<T>>();

  const retry = useCallback(() => {
    request.current?.abort();
    if (!enabled || !userId) return;
    const controller = new AbortController();
    request.current = controller;
    const previous = remembered.current.get(key)?.data;
    setSnapshot({ key, data: previous, error: false, loading: true });
    return load(controller.signal).then(
      data => {
        if (!controller.signal.aborted) {
          const cache = remembered.current;
          cache.delete(key);
          cache.set(key, { data, loadedAt: Date.now() });
          if (cache.size > maxRememberedQueries) {
            const oldest = cache.keys().next().value;
            if (oldest !== undefined) cache.delete(oldest);
          }
          setSnapshot({ key, data, error: false, loading: false });
        }
      },
      () => {
        if (!controller.signal.aborted) {
          setSnapshot({ key, data: previous, error: true, loading: false });
        }
      },
    );
  }, [enabled, key, load, userId]);

  const refreshIfStale = useCallback(() => {
    if (!enabled || !userId) return;
    const cached = remembered.current.get(key);
    const age = cached ? Date.now() - cached.loadedAt : Infinity;
    if (!cached || age < 0 || age >= reuseForMs) {
      void retry();
      return;
    }
    setSnapshot(current => current?.key === key ? current : { key, data: cached.data, loading: false, error: false });
  }, [enabled, key, retry, reuseForMs, userId]);

  useFocusEffect(useCallback(() => {
    if (!enabled) return;
    refreshIfStale();
    const subscription = reloadWhenActive ? AppState.addEventListener('change', state => {
      if (state === 'active') refreshIfStale();
    }) : undefined;
    return () => {
      subscription?.remove();
      request.current?.abort();
      setSnapshot(current => current?.key === key && current.loading ? { ...current, loading: false } : current);
    };
  }, [enabled, key, refreshIfStale, reloadWhenActive]));

  const current = snapshot?.key === key ? snapshot : undefined;
  return { data: current?.data, error: !!current?.error, loading: !!current?.loading, retry, refreshIfStale };
}
