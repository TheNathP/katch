import {
  createContext,
  use,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";

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
    return () => data.subscription.unsubscribe();
  }, []);

  return <SessionContext value={state}>{children}</SessionContext>;
}

export function useSession() {
  return use(SessionContext);
}
