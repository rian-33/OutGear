'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  apiFetch,
  type AuthPengguna,
  type AuthResult,
  type LoginPayload,
  type RegisterPayload,
} from './api';

interface AuthContextValue {
  /** Pengguna yang sedang login; `null` bila belum masuk. */
  user: AuthPengguna | null;
  /** True selama pengecekan sesi pertama kali masih berjalan. */
  loading: boolean;
  isAdmin: boolean;
  isPenghuni: boolean;
  login: (payload: LoginPayload) => Promise<AuthPengguna>;
  register: (payload: RegisterPayload) => Promise<AuthPengguna>;
  logout: () => Promise<void>;
  changePassword: (password_lama: string, password_baru: string) => Promise<AuthPengguna>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Ambil profil sesi aktif; kembali `null` bila belum login/refresh gagal. */
async function fetchMe(): Promise<AuthPengguna | null> {
  try {
    return await apiFetch<AuthPengguna>('/auth/me');
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthPengguna | null>(null);
  const [loading, setLoading] = useState(true);
  const checked = useRef(false);

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;
    void (async () => {
      setUser(await fetchMe());
      setLoading(false);
    })();
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const result = await apiFetch<AuthResult>('/auth/login', { method: 'POST', body: payload });
    setUser(result.pengguna);
    return result.pengguna;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const result = await apiFetch<AuthResult>('/auth/register', { method: 'POST', body: payload });
    setUser(result.pengguna);
    return result.pengguna;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
    }
  }, []);

  const changePassword = useCallback(async (password_lama: string, password_baru: string) => {
    const result = await apiFetch<AuthResult>('/auth/password', {
      method: 'PATCH',
      body: { password_lama, password_baru },
    });
    setUser(result.pengguna);
    return result.pengguna;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: user?.role === 'ADMIN',
        isPenghuni: user?.role === 'PENGHUNI',
        login,
        register,
        logout,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam <AuthProvider>.');
  return ctx;
}
