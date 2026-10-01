"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getStoredHilitechSession,
  refreshHilitechSession,
  signInWithHilitech,
  signOutFromHilitech,
  storeHilitechSession,
  type HilitechSession,
} from "@/lib/auth";

interface AuthContextValue {
  session: HilitechSession | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<HilitechSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSession(getStoredHilitechSession());
    setLoading(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      loading,
      signIn: async (email, password) => {
        const next = await signInWithHilitech(email, password);
        setSession(next);
      },
      signOut: async () => {
        await signOutFromHilitech();
        setSession(null);
      },
      refresh: async () => {
        try {
          const next = await refreshHilitechSession();
          setSession(next);
        } catch (error) {
          storeHilitechSession(null);
          setSession(null);
          throw error;
        }
      },
    }),
    [session, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return value;
}
