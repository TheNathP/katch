import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

export function useFriendsQuery<T>(load: () => Promise<T>) {
  const [state, setState] = useState<{ source?: typeof load; revision?: number; value?: T; error?: string }>({});
  const [revision, setRevision] = useState(0);

  useFocusEffect(useCallback(() => {
    let active = true;
    setState(current => ({ source: load, revision, value: current.source === load ? current.value : undefined }));
    load().then(
      value => { if (active) setState({ source: load, revision, value }); },
      error => {
        if (active) setState(current => ({
          ...current,
          error: error instanceof Error ? error.message : 'Impossible de charger cette page.',
        }));
      },
    );
    return () => { active = false; };
  }, [load, revision]));

  return {
    value: state.source === load ? state.value : undefined,
    error: state.source === load && state.revision === revision ? state.error : undefined,
    reload: () => setRevision(n => n + 1),
    update: (change: (value: T) => T) => setState(current => {
      if (current.source !== load || current.value === undefined) return current;
      return { ...current, value: change(current.value) };
    }),
  };
}
