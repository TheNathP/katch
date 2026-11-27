import {
  createContext,
  use,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import { AppState } from "react-native";

import { toAuthUser, type AuthUser } from "./adapters/auth.adapters";
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
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ user: toAuthUser(session), isLoading: false });
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
