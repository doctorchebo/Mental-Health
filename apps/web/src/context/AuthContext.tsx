"use client";

import { logout as apiLogout, getGoogleLoginUrl, getMe } from "@/lib/api";
import type { User } from "@mental-health/types";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const LOGIN_URL = getGoogleLoginUrl();

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  loginUrl: string;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const me = await getMe();
      setUser(me);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
    router.push("/");
  }, [router]);

  return (
    <AuthContext.Provider
      value={useMemo(
        () => ({ user, loading, loginUrl: LOGIN_URL, logout, refreshUser }),
        [user, loading, logout, refreshUser],
      )}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
