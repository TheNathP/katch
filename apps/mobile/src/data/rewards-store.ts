import AsyncStorage from '@react-native-async-storage/async-storage';

import { adaptRewards } from '@/data/adapters/rewards.adapters';
import type { ChangeRewardRequest, RewardsResponse } from '@/data/api.types';
import { callEdgeFunction, EdgeFunctionError } from '@/data/edge-functions';

const freshnessMs = 30_000;

type Snapshot = { data?: RewardsResponse; busy: boolean; error?: string; actionError?: string };

function createStore(accountId?: string) {
  const listeners = new Set<() => void>();
  let snapshot: Snapshot = { busy: false };
  let reading: Promise<void> | undefined;
  let freshUntil = 0;
  let revision = 0;
  const cacheKey = accountId ? `katch:rewards:${accountId}` : undefined;
  const hydration = cacheKey ? AsyncStorage.getItem(cacheKey).then(stored => {
    if (stored && !snapshot.data) publish({ ...snapshot, data: adaptRewards(JSON.parse(stored)) });
  }).catch(() => {}) : undefined;

  function publish(next: Snapshot) {
    snapshot = next;
    listeners.forEach(listener => listener());
  }

  function save(data: RewardsResponse, busy: boolean, actionError?: string) {
    freshUntil = performance.now() + freshnessMs;
    publish({ data, busy, actionError });
    if (cacheKey) void AsyncStorage.setItem(cacheKey, JSON.stringify(data)).catch(() => {});
  }

  function load() {
    if (!accountId || reading || snapshot.busy || freshUntil > performance.now()) return reading;
    const version = revision;
    reading = (async () => {
      await hydration;
      if (version !== revision) return;
      try {
        const raw = await callEdgeFunction('rewards', { method: 'GET', expectedUserId: accountId });
        if (version === revision) {
          save(adaptRewards(raw), snapshot.busy, snapshot.actionError);
        }
      } catch (error) {
        if (version !== revision || snapshot.data) return;
        const unavailable = error instanceof EdgeFunctionError && error.status === 404 && (error.code === null || error.code === "NOT_FOUND");
        publish({
          ...snapshot,
          error: unavailable
            ? 'Les récompenses ne sont pas encore disponibles sur ce serveur.'
            : 'Impossible de charger les récompenses.',
        });
      }
    })().finally(() => { reading = undefined; });
    if (snapshot.error) publish({ ...snapshot, error: undefined });
    return reading;
  }

  function invalidate() {
    revision += 1;
    freshUntil = 0;
    if (reading) void reading.then(() => load());
    else void load();
  }

  async function change(body: ChangeRewardRequest) {
    if (!accountId || snapshot.busy || !snapshot.data) return false;
    publish({ data: snapshot.data, busy: true });
    await reading;
    const version = revision;
    try {
      const raw = await callEdgeFunction('rewards', { method: 'POST', body, expectedUserId: accountId });
      save(adaptRewards(raw), false);
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
      if (insufficient) invalidate();
      return false;
    } finally {
      if (version !== revision) {
        freshUntil = 0;
        void load();
      }
    }
  }

  function clearActionError() {
    if (snapshot.actionError) publish({ ...snapshot, actionError: undefined });
  }

  return {
    load, invalidate, change, clearActionError,
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
