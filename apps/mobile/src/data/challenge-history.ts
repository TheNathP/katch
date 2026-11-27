import { adaptChallengeHistory, adaptColorCollection, adaptPhotoGallery } from '@/data/adapters/challenge-history.adapters';
import { callEdgeFunction } from '@/data/edge-functions';

const endpoint = 'get-my-challenge-history';

export async function getChallengeHistory(signal: AbortSignal, month?: string) {
  const name = month ? endpoint + '?month=' + encodeURIComponent(month) : endpoint;
  return adaptChallengeHistory(await callEdgeFunction(name, { method: 'GET', signal }));
}

export async function getPastChallenge(signal: AbortSignal, date: string) {
  const history = adaptChallengeHistory(await callEdgeFunction(endpoint + '?date=' + encodeURIComponent(date), {
    method: 'GET',
    signal,
  }));
  return history.entries.find((entry) => entry.date === date) ?? null;
}

export async function getColorCollection(signal: AbortSignal, before?: string | null) {
  return adaptColorCollection(await callEdgeFunction(endpoint + '?collection=' + encodeURIComponent(before ?? 'latest'), {
    method: 'GET',
    signal,
  }));
}

export async function getPhotoGallery(signal: AbortSignal, before?: string | null) {
  return adaptPhotoGallery(await callEdgeFunction(endpoint + '?gallery=' + encodeURIComponent(before ?? 'latest'), {
    method: 'GET',
    signal,
  }));
}
