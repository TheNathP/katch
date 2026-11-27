import { adaptRewards } from '@/data/adapters/rewards.adapters';
import type { ChangeRewardRequest, RewardsResponse } from '@/data/api.types';
import { callEdgeFunction, EdgeFunctionError } from '@/data/edge-functions';

type Snapshot = { data?: RewardsResponse; busy: boolean; error?: string; actionError?: string };

function createStore(accountId?: string) {
  const listeners = new Set<() => void>();
  let snapshot: Snapshot = { busy: false };
  let reading: Promise<void> | undefined;

  function publish(next: Snapshot) {
    snapshot = next;
    listeners.forEach(listener => listener());
  }

  function load() {
    if (!accountId || reading || snapshot.busy) return reading;
    publish({ ...snapshot, error: undefined });
    reading = callEdgeFunction('rewards', { method: 'GET', expectedUserId: accountId })
      .then(raw => publish({ ...snapshot, data: adaptRewards(raw), error: undefined }))
      .catch((error: unknown) => {
        const unavailable = error instanceof EdgeFunctionError && error.status === 404 && error.code === null;
        publish({
          ...snapshot,
          error: unavailable
            ? 'Les récompenses ne sont pas encore disponibles sur ce serveur.'
            : 'Impossible de charger les récompenses.',
        });
      })
      .finally(() => { reading = undefined; });
    return reading;
  }

  async function change(body: ChangeRewardRequest) {
    if (!accountId || snapshot.busy || !snapshot.data) return false;
    publish({ data: snapshot.data, busy: true });
    await reading;
    try {
      const raw = await callEdgeFunction('rewards', { method: 'POST', body, expectedUserId: accountId });
      publish({ data: adaptRewards(raw), busy: false });
      return true;
    } catch (error) {
      const insufficient = error instanceof EdgeFunctionError && error.code === 'insufficient_coins';
      publish({
        data: snapshot.data,
        busy: false,
        actionError: insufficient
          ? 'Tu n’as plus assez de KatchCoins pour cet achat.'
          : 'Impossible d’enregistrer cette action. Réessaie.',
      });
      if (insufficient) void load();
      return false;
    }
  }

  function clearActionError() {
    if (snapshot.actionError) publish({ ...snapshot, actionError: undefined });
  }

  return {
    load, change, clearActionError,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    snapshot: () => snapshot,
  };
}

const signedOutStore = createStore();
const stores = new Map<string, ReturnType<typeof createStore>>();

export function rewardsStore(accountId?: string) {
  if (!accountId) return signedOutStore;
  const existing = stores.get(accountId);
  if (existing) return existing;
  const store = createStore(accountId);
  stores.set(accountId, store);
  return store;
}
