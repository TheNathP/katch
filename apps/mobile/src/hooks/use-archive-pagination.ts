import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { useArchiveQuery } from '@/hooks/use-archive-query';

export function useArchivePagination<T extends { nextCursor: string | null }>(
  key: string,
  load: (signal: AbortSignal, cursor?: string) => Promise<T>,
  append: (current: T, next: T) => T,
  enabled = true,
) {
  // Preserve the loaded pages when returning from a result, within the signed photo URL lifetime.
  const first = useArchiveQuery(key, load, { enabled, reuseForMs: 5 * 60_000, reloadWhenActive: true });
  const [extra, setExtra] = useState<{ base: T; data: T }>();
  const [adding, setAdding] = useState(false);
  const [moreFailed, setMoreFailed] = useState(false);
  const pending = useRef<AbortController | null>(null);
  const data = extra && extra.base === first.data ? extra.data : first.data;

  useFocusEffect(useCallback(() => () => {
    pending.current?.abort();
    pending.current = null;
    setAdding(false);
    setMoreFailed(false);
  }, []));

  async function loadMore() {
    if (!first.data || !data?.nextCursor || pending.current) return;
    const controller = new AbortController();
    pending.current = controller;
    setAdding(true);
    setMoreFailed(false);
    try {
      const next = await load(controller.signal, data.nextCursor);
      if (!controller.signal.aborted) setExtra({ base: first.data, data: append(data, next) });
    } catch {
      if (!controller.signal.aborted) setMoreFailed(true);
    } finally {
      if (pending.current === controller) {
        pending.current = null;
        setAdding(false);
      }
    }
  }

  return { ...first, data, adding, moreFailed, loadMore };
}
