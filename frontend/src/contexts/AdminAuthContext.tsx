import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { adminAuthApi } from '../services/api';
import type { Admin } from '../types/api';

const STORAGE_ADMIN = 'inglish_admin';

interface AdminAuthContextValue {
  admin: Admin | null;
  token: string | null;
  isLoading: boolean;
  login: (login: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_ADMIN);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => adminAuthApi.getStoredToken());
  const [isLoading, setIsLoading] = useState(!!token);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    adminAuthApi
      .me()
      .then((data) => {
        setAdmin(data);
        localStorage.setItem(STORAGE_ADMIN, JSON.stringify(data));
      })
      .catch(() => {
        setToken(null);
        setAdmin(null);
        adminAuthApi.clearToken();
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  useEffect(() => {
    const onUnauthorized = () => {
      setToken(null);
      setAdmin(null);
    };
    window.addEventListener('inglish_admin_unauthorized', onUnauthorized);
    return () => window.removeEventListener('inglish_admin_unauthorized', onUnauthorized);
  }, []);

  const login = useCallback(async (loginName: string, password: string) => {
    const { admin: a, token: t } = await adminAuthApi.login(loginName, password);
    setAdmin(a);
    setToken(t);
    adminAuthApi.setToken(t);
    localStorage.setItem(STORAGE_ADMIN, JSON.stringify(a));
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setAdmin(null);
    adminAuthApi.clearToken();
  }, []);

  return (
    <AdminAuthContext.Provider value={{ admin, token, isLoading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
