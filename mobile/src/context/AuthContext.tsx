import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearSession, getSession, saveSession } from "../services/storage";

type AuthContextValue = {
  isHydrating: boolean;
  isLoggedIn: boolean;
  email: string;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isHydrating, setIsHydrating] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function hydrate() {
      const session = await getSession();
      if (session?.isLoggedIn) {
        setIsLoggedIn(true);
        setEmail(session.email);
      }
      setIsHydrating(false);
    }
    hydrate();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isHydrating,
      isLoggedIn,
      email,
      signIn: async (nextEmail: string) => {
        const normalized = nextEmail.trim().toLowerCase();
        await saveSession({ isLoggedIn: true, email: normalized });
        setEmail(normalized);
        setIsLoggedIn(true);
      },
      signOut: async () => {
        await clearSession();
        setEmail("");
        setIsLoggedIn(false);
      },
    }),
    [isHydrating, isLoggedIn, email]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
