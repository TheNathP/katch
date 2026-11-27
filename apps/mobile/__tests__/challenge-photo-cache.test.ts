import { challengePhotoImageSource, readChallengePhotoSource } from '@/lib/challenge-photo';

test('reuses a photo across link renewals and gives a retake its own cache key', () => {
  const storage = 'https://katch.example/storage/v1/object/sign/challenge-photos/player';
  const first = readChallengePhotoSource(`${storage}/attempt-a.jpg?token=old`);
  const renewed = readChallengePhotoSource(`${storage}/attempt-a.jpg?token=fresh`);
  const retake = readChallengePhotoSource(`${storage}/attempt-b.jpg?token=other`);
  if (!first || !renewed || !retake) throw new Error('Expected valid signed photo URLs');

  const preview = challengePhotoImageSource(first, 'preview');
  expect(challengePhotoImageSource(renewed, 'preview')).toEqual({
    uri: `${storage}/attempt-a.jpg?token=fresh`,
    cacheKey: preview.cacheKey,
  });
  expect(challengePhotoImageSource(retake, 'preview').cacheKey).not.toBe(preview.cacheKey);
  expect(challengePhotoImageSource(renewed, 'detail').cacheKey).not.toBe(preview.cacheKey);
});
