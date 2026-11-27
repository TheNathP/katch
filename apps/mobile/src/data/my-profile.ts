import {
  adaptMyProfile,
  toUpdateMyProfileRequest,
  type MyProfile,
  type MyProfileChanges,
} from "@/data/adapters/my-profile.adapters";
import { callEdgeFunction } from "@/data/edge-functions";

const freshnessMs = 60_000;

type Snapshot = { profile?: MyProfile; loadFailed: boolean };

function createStore(accountId?: string) {
  const listeners = new Set<() => void>();
  let snapshot: Snapshot = { loadFailed: false };
  let freshUntil = 0;
  let request: { controller: AbortController; done: Promise<void> } | undefined;

  function publish(next: Snapshot) {
    snapshot = next;
    listeners.forEach(listener => listener());
  }

  function invalidate() {
    freshUntil = 0;
    request?.controller.abort();
    request = undefined;
  }

  function load(force = false) {
    if (!accountId || (!force && freshUntil > performance.now())) return;
    if (request) return request.done;

    const controller = new AbortController();
    const done = callEdgeFunction("get-my-profile", {
      method: "GET",
      expectedUserId: accountId,
      signal: controller.signal,
    }).then(adaptMyProfile).then(profile => {
      if (controller.signal.aborted) return;
      freshUntil = performance.now() + freshnessMs;
      publish({ profile, loadFailed: false });
    }).catch(() => {
      if (!controller.signal.aborted && !snapshot.profile) publish({ loadFailed: true });
    }).finally(() => {
      if (request?.controller === controller) request = undefined;
    });
    request = { controller, done };
    if (snapshot.loadFailed) publish({ ...snapshot, loadFailed: false });
    return done;
  }

  async function update(changes: MyProfileChanges) {
    if (!accountId) throw new Error("Missing account");
    const updated = adaptMyProfile(await callEdgeFunction("update-my-profile", {
      method: "PATCH",
      expectedUserId: accountId,
      body: toUpdateMyProfileRequest(changes),
    }));
    // The edit endpoint can omit challenge stats, which are fetched separately.
    const profile = { ...updated, challengeStats: updated.challengeStats ?? snapshot.profile?.challengeStats };
    const previousFreshness = freshUntil;
    invalidate();
    freshUntil = updated.challengeStats ? performance.now() + freshnessMs : previousFreshness;
    publish({ profile, loadFailed: false });
  }

  return {
    load, update, invalidate,
    snapshot: () => snapshot,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
  };
}

const signedOutStore = createStore();
const stores = new Map<string, ReturnType<typeof createStore>>();

export function myProfileStore(accountId?: string) {
  if (!accountId) return signedOutStore;
  const existing = stores.get(accountId);
  if (existing) return existing;
  const store = createStore(accountId);
  stores.set(accountId, store);
  return store;
}
