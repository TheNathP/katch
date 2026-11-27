import {
  createContext,
  use,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import { AppState } from "react-native";

import { toAuthUser, type AuthUser } from "./adapters/auth.adapters";
import { clearLocalAccountData } from "./clear-local-account-data";
import { supabase } from "./supabase";

type SessionState = {
  user: AuthUser | null;
  isLoading: boolean;
};

const SessionContext = createContext<SessionState>({
  user: null,
  isLoading: true,
});

export function SessionProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<SessionState>({
    user: null,
    isLoading: true,
  });

  useEffect(() => {
    let signedInUserId: string | null = null;
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      const user = toAuthUser(session);
      // Covers sign-out, account deletion and an expired session alike. Not
      // awaited: Supabase advises against async work inside this callback.
      if (event === "SIGNED_OUT" && signedInUserId) void clearLocalAccountData(signedInUserId);
      signedInUserId = user?.id ?? null;
      setState({ user, isLoading: false });
    });
    function syncAutoRefresh(appState: typeof AppState.currentState) {
      if (appState === "active") void supabase.auth.startAutoRefresh();
      else void supabase.auth.stopAutoRefresh();
    }

    syncAutoRefresh(AppState.currentState);
    const listener = AppState.addEventListener("change", syncAutoRefresh);
    return () => {
      listener.remove();
      data.subscription.unsubscribe();
      void supabase.auth.stopAutoRefresh();
    };
  }, []);

  return <SessionContext value={state}>{children}</SessionContext>;
}

export function useSession() {
  return use(SessionContext);
}
