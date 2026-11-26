import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  createDemoProgression,
  demoStartingCoins,
  purchaseDemoItem,
  readDemoProgression,
  resetDemoShop,
  type DemoProgression,
  type ShopItem,
  utcDay,
} from '@/lib/progression';

const inventoryResetRevision = 2;
const shopRevision = 3;

function serialize(data: DemoProgression) {
  return JSON.stringify({ ...data, shopRevision });
}

type Snapshot = { data?: DemoProgression; busy: boolean; error?: string };

function createStore(accountId: string) {
  const key = `katch:progression-demo:v1:${accountId}`;
  const listeners = new Set<() => void>();
  let snapshot: Snapshot = { busy: false };

  function publish(next: Snapshot) {
    snapshot = next;
    listeners.forEach(listener => listener());
  }

  async function load() {
    if (snapshot.data || snapshot.busy) return;
    publish({ busy: true });
    try {
      const raw = await AsyncStorage.getItem(key);
      let stored: DemoProgression | undefined;
      if (raw) {
        try {
          const parsed: unknown = JSON.parse(raw);
          stored = readDemoProgression(parsed);
          const revision = parsed && typeof parsed === 'object'
            && 'shopRevision' in parsed && typeof parsed.shopRevision === 'number'
            ? parsed.shopRevision : 0;
          if (stored && revision < shopRevision) {
            stored = revision < inventoryResetRevision
              ? resetDemoShop(stored)
              : { ...stored, coins: demoStartingCoins };
          }
        } catch {
          // Replace unreadable demo data with a fresh local sample.
        }
      }
      const data = stored ?? createDemoProgression(utcDay());
      const serialized = serialize(data);
      if (raw !== serialized) await AsyncStorage.setItem(key, serialized);
      publish({ data, busy: false });
    } catch {
      publish({ busy: false, error: 'Impossible de charger la progression.' });
    }
  }

  async function change(update: (data: DemoProgression) => DemoProgression) {
    const { data, busy } = snapshot;
    if (!data || busy) return false;
    const next = update(data);
    if (next === data) return false;

    publish({ data, busy: true });
    try {
      await AsyncStorage.setItem(key, serialize(next));
      publish({ data: next, busy: false });
      return true;
    } catch {
      publish({ data, busy: false, error: 'Impossible d’enregistrer cette action. Réessaie.' });
      return false;
    }
  }

  return {
    load,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    snapshot: () => snapshot,
    purchase: (item: ShopItem) => change(data => purchaseDemoItem(data, item)),
  };
}

const stores = new Map<string, ReturnType<typeof createStore>>();

export function progressionStore(accountId: string) {
  const existing = stores.get(accountId);
  if (existing) return existing;
  const store = createStore(accountId);
  stores.set(accountId, store);
  return store;
}
