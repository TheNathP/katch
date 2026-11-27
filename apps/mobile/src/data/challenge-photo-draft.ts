import { randomUUID } from 'expo-crypto';

import { discardTemporaryPhoto } from '@/lib/discard-temporary-photo';

type ChallengePhotoDraft = {
  id: string;
  uri: string;
  takenAt: string | null;
  fromCamera: boolean;
};

// Only the latest capture or import can be awaiting confirmation.
let draft: ChallengePhotoDraft | undefined;

export function rememberChallengePhotoDraft(uri: string, takenAt: string | null, fromCamera = false): string {
  if (draft) discardChallengePhotoDraft(draft.id);
  const id = randomUUID();
  draft = { id, uri, takenAt, fromCamera };
  return id;
}

export function getChallengePhotoDraft(id: string): ChallengePhotoDraft | undefined {
  return draft?.id === id ? draft : undefined;
}

export function discardChallengePhotoDraft(id: string) {
  if (draft?.id !== id) return;
  if (draft.fromCamera) discardTemporaryPhoto(draft.uri);
  draft = undefined;
}
