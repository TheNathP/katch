import { submitChallengePhoto } from '@/data/challenge-attempt';
import { callEdgeFunction } from '@/data/edge-functions';
import { myProfileStore } from '@/data/my-profile';

jest.mock('@/data/edge-functions', () => ({
  callEdgeFunction: jest.fn(),
  EdgeFunctionError: class extends Error {},
}));
jest.mock('@/data/daily-color-cache', () => ({ cacheDailySubmission: jest.fn() }));
jest.mock('@/data/rewards-store', () => ({
  rewardsStore: () => ({ invalidate: jest.fn(), snapshot: () => ({}) }),
}));
jest.mock('expo-file-system', () => ({ File: jest.fn((uri: string) => ({ uri })) }));
jest.mock('expo-image-manipulator', () => ({
  SaveFormat: { JPEG: 'jpeg' },
  ImageManipulator: {
    manipulate: () => ({
      renderAsync: async () => ({
        width: 640,
        height: 480,
        saveAsync: async () => ({ uri: 'file:///cache/challenge-upload.jpg' }),
      }),
    }),
  },
}));

test('refreshes profile stats after submitting a photo and ignores the earlier response', async () => {
  const api = jest.mocked(callEdgeFunction);
  const accountId = 'player-with-a-previous-challenge';
  const profile = myProfileStore(accountId);
  const before = {
    displayName: 'Pix',
    avatarId: 'happy',
    avatarBackgroundId: 'violet',
    challengeStats: { completedChallenges: 1, averageScore: 80 },
  };
  const after = { ...before, challengeStats: { completedChallenges: 2, averageScore: 87 } };
  const olderResponse = Promise.withResolvers<typeof before>();
  api.mockResolvedValueOnce(before)
    .mockReturnValueOnce(olderResponse.promise)
    .mockResolvedValueOnce({
      attemptId: 'new-attempt',
      challengeDate: '2026-11-27',
      targetHex: '#8342CC',
      matchedHex: '#8240CB',
      score: 94,
      scorePercent: 94.3,
    })
    .mockResolvedValueOnce(after);

  await profile.load();
  expect(profile.snapshot().profile?.challengeStats).toEqual(before.challengeStats);
  const previousRefresh = profile.load(true);

  await submitChallengePhoto('file:///gallery/challenge.jpg', null, accountId);
  const refreshAfterSubmission = profile.load();
  expect(api).toHaveBeenNthCalledWith(4, 'get-my-profile', expect.objectContaining({ expectedUserId: accountId }));
  await refreshAfterSubmission;

  olderResponse.resolve(before);
  await previousRefresh;
  expect(profile.snapshot().profile?.challengeStats).toEqual(after.challengeStats);
});
