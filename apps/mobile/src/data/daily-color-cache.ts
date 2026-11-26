import AsyncStorage from '@react-native-async-storage/async-storage';

import { adaptDailyChallenge, restoreDailyChallenge, type DailyColorSnapshot, type DailySubmission } from '@/data/adapters/daily-color.adapters';
import type { DailyColorResponse } from '@/data/api.types';
import { callEdgeFunction } from '@/data/edge-functions';

const colorKey = 'katch:daily-color:snapshot';
const freshnessMs = 30_000;

type AccountCache = {
  snapshot?: string;
  hydration?: Promise<void>;
  request?: Promise<void>;
  freshUntil?: number;
  latestSubmission?: { date: string; submission: DailySubmission };
};

const accounts = new Map<string, AccountCache>();

function cacheFor(accountId: string) {
  const existing = accounts.get(accountId);
  if (existing) return existing;
  const cache: AccountCache = {};
  accounts.set(accountId, cache);
  return cache;
}

const accountKey = (accountId: string) => `${colorKey}:${accountId}`;

function read(snapshot?: string | null) {
  return snapshot ? restoreDailyChallenge(snapshot, Date.now(), performance.now()) : null;
}

function saveAccount(accountId: string, cache: AccountCache, snapshot: DailyColorSnapshot) {
  cache.snapshot = JSON.stringify(snapshot);
  void AsyncStorage.setItem(accountKey(accountId), cache.snapshot).catch(() => {});
}

export async function getCachedDailyChallenge(accountId?: string) {
  const cache = accountId ? cacheFor(accountId) : undefined;
  let daily = null;
  if (accountId && cache) {
    if (!cache.hydration) {
      cache.hydration = AsyncStorage.getItem(accountKey(accountId)).then(value => {
        cache.snapshot ??= value ?? undefined;
      }).catch(() => {});
    }
    await cache.hydration;
    daily = read(cache.snapshot);
  }

  if (!daily) {
    const shared = read(await AsyncStorage.getItem(colorKey).catch(() => null));
    // Older versions stored the signed-in player's submission under the shared color key.
    daily = shared ? { ...shared, submission: null } : null;
  }

  const latest = cache?.latestSubmission;
  return daily && latest?.date === daily.color.date ? { ...daily, submission: latest.submission } : daily;
}

export async function refreshDailyChallenge(accountId: string) {
  const cache = cacheFor(accountId);
  if (cache.request) {
    await cache.request;
  } else if ((cache.freshUntil ?? 0) <= performance.now()) {
    const submissionAtStart = cache.latestSubmission;
    cache.request = callEdgeFunction('get-daily-color', { method: 'GET', expectedUserId: accountId })
      .then(raw => {
        const savedAt = Date.now();
        const receivedAt = performance.now();
        const { color } = adaptDailyChallenge(raw, receivedAt);
        const response = raw as DailyColorResponse;
        const latest = cache.latestSubmission;
        const received = response.submission;
        const useLatest = latest?.date === color.date && (
          latest !== submissionAtStart ||
          (received?.scorePercent === undefined &&
            received?.score === latest.submission.score && received.matchedHex === latest.submission.matchedHex)
        );
        if (!useLatest && latest === submissionAtStart) cache.latestSubmission = undefined;
        saveAccount(accountId, cache, {
          response: useLatest ? { ...response, submission: latest.submission } : response,
          savedAt,
        });
        void AsyncStorage.setItem(colorKey, JSON.stringify({
          response: { ...response, submission: null }, savedAt,
        } satisfies DailyColorSnapshot)).catch(() => {});
        cache.freshUntil = Math.min(color.refreshAt, receivedAt + freshnessMs);
      })
      .finally(() => { cache.request = undefined; });
    await cache.request;
  }
  const daily = await getCachedDailyChallenge(accountId);
  if (!daily) throw new Error('Daily challenge unavailable');
  return daily;
}

export function cacheDailySubmission(accountId: string, date: string, submission: DailySubmission) {
  const cache = cacheFor(accountId);
  cache.latestSubmission = { date, submission };
  const stored = read(cache.snapshot);
  if (cache.snapshot && stored?.color.date === date) {
    const snapshot: DailyColorSnapshot = JSON.parse(cache.snapshot);
    saveAccount(accountId, cache, { ...snapshot, response: { ...snapshot.response, submission } });
  } else {
    cache.freshUntil = undefined;
  }
}
