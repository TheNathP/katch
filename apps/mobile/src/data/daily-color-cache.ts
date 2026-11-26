import AsyncStorage from '@react-native-async-storage/async-storage';

import { restoreDailyChallenge, type DailyColorSnapshot } from '@/data/adapters/daily-color.adapters';

const cacheKey = 'katch:daily-color:snapshot';

export async function getCachedDailyChallenge() {
  const snapshot = await AsyncStorage.getItem(cacheKey).catch(() => null);
  return snapshot ? restoreDailyChallenge(snapshot, Date.now(), performance.now()) : null;
}

export function saveDailyChallenge(snapshot: DailyColorSnapshot) {
  return AsyncStorage.setItem(cacheKey, JSON.stringify(snapshot));
}
