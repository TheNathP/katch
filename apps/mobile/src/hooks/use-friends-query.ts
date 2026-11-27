import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

export function useFriendsQuery<T>(load: (signal: AbortSignal) => Promise<T>, refreshKey?: string) {
  const [state, setState] = useState<{
    source?: typeof load;
    revision?: number;
    refreshKey?: string;
    value?: T;
    error?: string;
  }>({});
  const [revision, setRevision] = useState(0);

  useFocusEffect(useCallback(() => {
    const controller = new AbortController();
    setState(current => ({
      source: load,
      revision,
      refreshKey,
      value: current.source === load ? current.value : undefined,
    }));
    load(controller.signal).then(
      value => { if (!controller.signal.aborted) setState({ source: load, revision, refreshKey, value }); },
      error => {
        if (!controller.signal.aborted) setState(current => ({
          ...current,
          error: error instanceof Error ? error.message : 'Impossible de charger cette page.',
        }));
      },
    );
    return () => controller.abort();
  }, [load, revision, refreshKey]));

  return {
    value: state.source === load ? state.value : undefined,
    error: state.source === load && state.revision === revision && state.refreshKey === refreshKey
      ? state.error
      : undefined,
    reload: () => setRevision(n => n + 1),
    update: (change: (value: T) => T) => setState(current => {
      if (current.source !== load || current.value === undefined) return current;
      return { ...current, value: change(current.value) };
    }),
  };
}
