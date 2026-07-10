'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { API, apiFetch } from '@/lib/api';

interface NexoUser {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  role: 'GUEST' | 'SUBSCRIBER' | 'ADMIN';
  avatarUrl: string | null;
  subscription: {
    status: string;
    expiresAt: string;
    plan: {
      name: string;
      dailyDownloadLimit: number;
      monthlyDownloadLimit: number;
      canWatch: boolean;
      canDownload: boolean;
      hasHd: boolean;
      has4k: boolean;
    };
  } | null;
  downloadStats?: {
    today: number;
    uniqueThisMonth: number;
    dailyLimit: number;
    monthlyLimit: number;
  };
}

interface AuthContextType {
  user: NexoUser | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  isSubscriber: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<NexoUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    const token = localStorage.getItem('nexo_access_token');
    if (!token) { setUser(null); setIsLoading(false); return; }
    try {
      const res = await apiFetch(API.AUTH.ME);
      setUser(res.data);
    } catch {
      localStorage.removeItem('nexo_access_token');
      localStorage.removeItem('nexo_refresh_token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();

    // Poll every 60 seconds for real-time security (banned/suspended users)
    const interval = setInterval(() => {
      if (localStorage.getItem('nexo_access_token')) {
        refreshUser();
      }
    }, 60000);

    // Also check immediately when tab comes to foreground
    const handleFocus = () => {
      if (localStorage.getItem('nexo_access_token')) {
        refreshUser();
      }
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiFetch(API.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('nexo_access_token', res.data.accessToken);
    localStorage.setItem('nexo_refresh_token', res.data.refreshToken);
    setUser(res.data.user);
  };

  const register = async (data: { email: string; password: string; name?: string }) => {
    const res = await apiFetch(API.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    localStorage.setItem('nexo_access_token', res.data.accessToken);
    localStorage.setItem('nexo_refresh_token', res.data.refreshToken);
    setUser(res.data.user);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('nexo_refresh_token');
    if (refreshToken) {
      apiFetch(API.AUTH.LOGOUT, { method: 'POST', body: JSON.stringify({ refreshToken }) }).catch(() => {});
    }
    localStorage.removeItem('nexo_access_token');
    localStorage.removeItem('nexo_refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isLoggedIn: !!user,
      isSubscriber: !!(
        user?.subscription?.status === 'ACTIVE' &&
        user?.subscription?.plan?.canWatch &&
        new Date(user.subscription.expiresAt) > new Date()
      ),
      isAdmin: user?.role === 'ADMIN',
      login,
      register,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
