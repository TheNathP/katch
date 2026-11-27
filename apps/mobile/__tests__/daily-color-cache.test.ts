import { restoreDailyChallenge } from '@/data/adapters/daily-color.adapters';

test('restores the offline color with only the time remaining before the UTC reset', () => {
  const savedAt = Date.parse('2026-11-26T23:55:00Z');
  const snapshot = JSON.stringify({
    savedAt,
    response: {
      date: '2026-11-26',
      colorHex: '#8A3FFC',
      serverTime: '2026-11-26T23:55:00Z',
      endsAt: '2026-11-27T00:00:00Z',
    },
  });
  const receivedAt = 1_000;
  const reopenedBeforeReset = restoreDailyChallenge(snapshot, savedAt + 4 * 60_000, receivedAt);
  const reopenedAfterReset = restoreDailyChallenge(snapshot, savedAt + 6 * 60_000, receivedAt);

  expect(reopenedBeforeReset?.color).toEqual({
    date: '2026-11-26',
    hex: '#8A3FFC',
    refreshAt: receivedAt + 60_000,
  });
  expect(reopenedAfterReset?.color.hex).toBe('#8A3FFC');
  expect(reopenedAfterReset?.color.refreshAt).toBe(receivedAt - 60_000);
});
