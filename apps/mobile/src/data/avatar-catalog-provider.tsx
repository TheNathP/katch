import {
  createContext,
  use,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";

import type { AvatarCatalog } from "./adapters/avatar-catalog.adapters";
import {
  getCachedAvatarCatalog,
  refreshAvatarCatalog,
} from "./avatar-catalog";

type AvatarCatalogState = {
  /** null until the device cache or the server answered. */
  catalog: AvatarCatalog | null;
  /** True when the server could not be reached and nothing is cached. */
  loadFailed: boolean;
  retry: () => void;
};

const AvatarCatalogContext = createContext<AvatarCatalogState>({
  catalog: null,
  loadFailed: false,
  retry: () => {},
});

/**
 * Loads the avatar catalog once for the whole app, at launch: the copy stored
 * on the device first, then one refresh from the server, which also stores
 * the images in expo-image's disk cache. Screens read it with
 * `useAvatarCatalog()` and never fetch it themselves.
 */
export function AvatarCatalogProvider({ children }: PropsWithChildren) {
  const [catalog, setCatalog] = useState<AvatarCatalog | null>(null);
  const [refreshFailed, setRefreshFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let refreshed = false;

    getCachedAvatarCatalog().then((cached) => {
      if (cached && !refreshed && !controller.signal.aborted) setCatalog(cached);
    });
    refreshAvatarCatalog(controller.signal).then(
      (fresh) => {
        refreshed = true;
        setCatalog(fresh);
        setRefreshFailed(false);
      },
      () => {
        if (!controller.signal.aborted) setRefreshFailed(true);
      },
    );

    return () => controller.abort();
  }, [attempt]);

  const state: AvatarCatalogState = {
    catalog,
    loadFailed: refreshFailed && catalog === null,
    retry: () => {
      setRefreshFailed(false);
      setAttempt((current) => current + 1);
    },
  };

  return <AvatarCatalogContext value={state}>{children}</AvatarCatalogContext>;
}

export function useAvatarCatalog() {
  return use(AvatarCatalogContext);
}
