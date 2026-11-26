import AsyncStorage from '@react-native-async-storage/async-storage';

import { restoreDailyColor, type DailyColorSnapshot } from '@/data/adapters/daily-color.adapters';

const cacheKey = 'katch:daily-color:snapshot';

export async function getCachedDailyColor() {
  const snapshot = await AsyncStorage.getItem(cacheKey).catch(() => null);
  return snapshot ? restoreDailyColor(snapshot, Date.now(), performance.now()) : null;
}

export function saveDailyColor(snapshot: DailyColorSnapshot) {
  return AsyncStorage.setItem(cacheKey, JSON.stringify(snapshot));
}
