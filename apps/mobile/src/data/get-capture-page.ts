import { refreshDailyChallenge } from '@/data/daily-color-cache';

export async function getCapturePage(accountId: string) {
  return (await refreshDailyChallenge(accountId)).color;
}
