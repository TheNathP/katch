import { useNavigation } from 'expo-router';
import { useEffect } from 'react';

/** Release a local resource after its screen leaves the navigation stack. */
export function useReleaseRouteResource(id: string | undefined, release: (id: string) => void) {
  const navigation = useNavigation();

  useEffect(() => {
    if (!id) return;
    const unsubscribe = navigation.addListener('removed', () => release(id));
    // Expo Router emits 'removed' after the screen's effect cleanup.
    return () => queueMicrotask(unsubscribe);
  }, [id, navigation, release]);
}
