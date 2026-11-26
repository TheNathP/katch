import { randomUUID } from 'expo-crypto';

type ChallengePhotoDraft = {
  id: string;
  uri: string;
  takenAt: string | null;
};

// Only the latest capture or import can be awaiting confirmation.
let draft: ChallengePhotoDraft | undefined;

export function rememberChallengePhotoDraft(uri: string, takenAt: string | null): string {
  const id = randomUUID();
  draft = { id, uri, takenAt };
  return id;
}

export function getChallengePhotoDraft(id: string): ChallengePhotoDraft | undefined {
  return draft?.id === id ? draft : undefined;
}

export function discardChallengePhotoDraft(id: string) {
  if (draft?.id === id) draft = undefined;
}
