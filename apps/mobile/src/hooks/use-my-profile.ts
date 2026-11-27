import { useFocusEffect } from "expo-router";
import { useCallback, useSyncExternalStore } from "react";

import { myProfileStore } from "@/data/my-profile";
import { useSession } from "@/data/session-provider";

export function useMyProfile() {
  const { user } = useSession();
  const store = myProfileStore(user?.id);
  const snapshot = useSyncExternalStore(store.subscribe, store.snapshot, store.snapshot);

  useFocusEffect(useCallback(() => {
    void store.load();
  }, [store]));

  return { ...snapshot, load: store.load, update: store.update };
}
