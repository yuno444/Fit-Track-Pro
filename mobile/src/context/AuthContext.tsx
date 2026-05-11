import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { registerAccount, verifyLogin } from "../services/accountStorage";
import { clearSession, getSession, saveSession } from "../services/sessionStorage";
import { runStorageMigrationV2 } from "../services/storageScope";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

type AuthContextValue = {
  isHydrating: boolean;
  isLoggedIn: boolean;
  userId: string;
  email: string;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isHydrating, setIsHydrating] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function hydrate() {
      await runStorageMigrationV2();
      const session = await getSession();
      if (session?.userId && session.email) {
        setIsLoggedIn(true);
        setUserId(session.userId);
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
      userId,
      email,
      signIn: async (nextEmail: string, password: string) => {
        const normalized = normalizeEmail(nextEmail);
        const { userId: uid } = await verifyLogin(normalized, password);
        await saveSession({ userId: uid, email: normalized });
        setEmail(normalized);
        setUserId(uid);
        setIsLoggedIn(true);
      },
      signUp: async (nextEmail: string, password: string) => {
        const normalized = normalizeEmail(nextEmail);
        const { userId: uid } = await registerAccount(normalized, password);
        await saveSession({ userId: uid, email: normalized });
        setEmail(normalized);
        setUserId(uid);
        setIsLoggedIn(true);
      },
      signOut: async () => {
        await clearSession();
        setEmail("");
        setUserId("");
        setIsLoggedIn(false);
      },
    }),
    [isHydrating, isLoggedIn, userId, email]
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
