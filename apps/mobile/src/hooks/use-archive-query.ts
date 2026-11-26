import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { useSession } from '@/data/session-provider';

type Snapshot<T> = { key: string; data?: T; error: boolean };

export function useArchiveQuery<T>(
  scope: string,
  load: (signal: AbortSignal) => Promise<T>,
  { enabled = true, reuseForMs = 0 }: { enabled?: boolean; reuseForMs?: number } = {},
) {
  const { user } = useSession();
  const userId = user?.id;
  const key = userId + '/' + scope;
  const request = useRef<AbortController | null>(null);
  const fresh = useRef<{ key: string; loadedAt: number } | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot<T>>();

  const retry = useCallback(() => {
    request.current?.abort();
    if (!enabled || !userId) return;
    const controller = new AbortController();
    request.current = controller;
    setSnapshot(current => ({ key, data: current?.key === key ? current.data : undefined, error: false }));
    void load(controller.signal).then(
      data => {
        if (!controller.signal.aborted) {
          fresh.current = { key, loadedAt: performance.now() };
          setSnapshot({ key, data, error: false });
        }
      },
      () => {
        if (!controller.signal.aborted) {
          setSnapshot(current => ({ key, data: current?.key === key ? current.data : undefined, error: true }));
        }
      },
    );
  }, [enabled, key, load, userId]);

  useFocusEffect(useCallback(() => {
    if (!enabled) return;
    if (fresh.current?.key !== key || performance.now() - fresh.current.loadedAt >= reuseForMs) retry();
    return () => request.current?.abort();
  }, [enabled, key, retry, reuseForMs]));

  return { data: snapshot?.key === key ? snapshot.data : undefined, error: snapshot?.key === key && snapshot.error, retry };
}
