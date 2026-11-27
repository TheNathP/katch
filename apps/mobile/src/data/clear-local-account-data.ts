import { Image } from 'expo-image';

import { clearChallengeAttempts } from '@/data/challenge-attempt';
import { clearDailyChallengeCache } from '@/data/daily-color-cache';
import { forgetDailyColorReveal } from '@/data/daily-color-reveal';
import { clearMyProfileCache } from '@/data/my-profile';
import { clearRewardsCache } from '@/data/rewards-store';

/**
 * Removes the signed-out player's data from the device: daily submission,
 * rewards, profile, pending result and in-memory images. Device-wide data that
 * holds nothing personal (shared daily color, avatar catalog, theme, onboarding)
 * is kept.
 */
export async function clearLocalAccountData(accountId: string) {
  clearMyProfileCache(accountId);
  clearChallengeAttempts(accountId);
  await Promise.allSettled([
    clearDailyChallengeCache(accountId),
    clearRewardsCache(accountId),
    forgetDailyColorReveal(),
    Image.clearMemoryCache(),
  ]);
}
