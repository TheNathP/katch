export type ChallengePhotoSource = {
  uri: string;
  identity: string;
};

type PhotoRendition = 'calendar' | 'preview' | 'detail';
const signedPhotoPath = '/storage/v1/object/sign/challenge-photos/';

export function readChallengePhotoSource(value: unknown): ChallengePhotoSource | null {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;

    // Signing the same immutable object again changes its token, not its image.
    if (url.pathname.startsWith(signedPhotoPath)) url.searchParams.delete('token');
    return { uri: value, identity: url.toString().split('#', 1)[0] };
  } catch {
    return null;
  }
}

export function challengePhotoImageSource(photo: ChallengePhotoSource, rendition: PhotoRendition) {
  // A small decoded thumbnail should not replace the higher-resolution detail.
  return { uri: photo.uri, cacheKey: 'challenge-photo:' + rendition + ':' + photo.identity };
}
