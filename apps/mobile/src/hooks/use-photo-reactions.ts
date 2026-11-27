import { useRef, useState } from 'react';

import { reactToFriendPhoto } from '@/data/friends';
import type { PhotoReactions, PixReaction } from '@/data/social-api.types';

export function usePhotoReactions(viewerId: string | undefined, onUpdate: (attempt: string, reactions: PhotoReactions) => void) {
  const activeReactions = useRef(new Set<string>());
  const [pending, setPending] = useState<ReadonlySet<string>>(new Set());
  const [reactionErrors, setReactionErrors] = useState<Record<string, string | undefined>>({});

  async function react(attempt: string, reaction: PixReaction | null) {
    if (!viewerId || activeReactions.current.has(attempt)) return false;
    activeReactions.current.add(attempt);
    setPending(new Set(activeReactions.current));
    setReactionErrors(current => ({ ...current, [attempt]: undefined }));
    try {
      const reactions = await reactToFriendPhoto(attempt, reaction, viewerId);
      onUpdate(attempt, reactions);
      return true;
    } catch (failure) {
      const message = failure instanceof Error ? failure.message : 'Ta réaction n’a pas pu être enregistrée.';
      setReactionErrors(current => ({ ...current, [attempt]: message }));
      return false;
    } finally {
      activeReactions.current.delete(attempt);
      setPending(new Set(activeReactions.current));
    }
  }

  return { pending, reactionErrors, react };
}
