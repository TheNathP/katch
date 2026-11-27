import { File } from 'expo-file-system';

export function discardTemporaryPhoto(uri: string) {
  try {
    const photo = new File(uri);
    if (photo.exists) photo.delete();
  } catch {
    // The OS may have already cleared the cache or still be reading the file.
  }
}
