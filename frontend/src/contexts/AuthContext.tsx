import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { authApi } from '../services/api';
import type { User } from '../types/api';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (login: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_TOKEN = 'inglish_token';
const STORAGE_USER = 'inglish_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_USER);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(STORAGE_TOKEN));
  const [isLoading, setIsLoading] = useState(!!token);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const u = await authApi.me();
      setUser(u);
      localStorage.setItem(STORAGE_USER, JSON.stringify(u));
    } catch {
      setToken(null);
      setUser(null);
      localStorage.removeItem(STORAGE_TOKEN);
      localStorage.removeItem(STORAGE_USER);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    refreshUser();
  }, [token, refreshUser]);

  useEffect(() => {
    const onUnauthorized = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener('inglish_unauthorized', onUnauthorized);
    return () => window.removeEventListener('inglish_unauthorized', onUnauthorized);
  }, []);

  const login = useCallback(async (loginName: string) => {
    const { user: u, token: t } = await authApi.login(loginName);
    setUser(u);
    setToken(t);
    localStorage.setItem(STORAGE_TOKEN, t);
    localStorage.setItem(STORAGE_USER, JSON.stringify(u));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(STORAGE_TOKEN);
    localStorage.removeItem(STORAGE_USER);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
