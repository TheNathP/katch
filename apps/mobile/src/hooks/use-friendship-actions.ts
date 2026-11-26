import { useRef, useState } from 'react';

import { changeFriendship } from '@/data/friends';
import type { FriendMutation } from '@/data/social-api.types';

export function useFriendshipActions(onChanged: (action: FriendMutation, target: string) => void) {
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  async function change(action: FriendMutation, target: string) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setError(undefined);
    try {
      await changeFriendship(action, target);
      onChanged(action, target);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Impossible de modifier cette demande.');
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  return { busy, error, change };
}
