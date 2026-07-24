'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { API, apiFetch } from '@/lib/api';

interface NexoUser {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  role: 'GUEST' | 'SUBSCRIBER' | 'RESELLER' | 'FRANCHISEE' | 'ADMIN';
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
    creditsUsedToday: number;
    creditsUsedTotal: number;
    boughtToday: number;
    effectiveLimit: number;
  };
}

interface NexoProfile {
  id: string;
  name: string;
  avatarUrl: string;
  isKids: boolean;
}

interface AuthContextType {
  user: NexoUser | null;
  profiles: NexoProfile[];
  activeProfile: NexoProfile | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  isSubscriber: boolean;
  isAdmin: boolean;
  isReseller: boolean;
  isFranchisee: boolean;
  showAds: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (data: { username?: string; email?: string; password: string; name?: string; asGuest?: boolean }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setActiveProfile: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<NexoUser | null>(null);
  const [profiles, setProfiles] = useState<NexoProfile[]>([]);
  const [activeProfile, setActiveProfileState] = useState<NexoProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setActiveProfile = (id: string) => {
    const profile = profiles.find(p => p.id === id);
    if (profile) {
      localStorage.setItem('nexo_active_profile_id', id);
      setActiveProfileState(profile);
    }
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('nexo_access_token');
    if (!token) { 
      setUser(null); 
      setProfiles([]);
      setActiveProfileState(null);
      setIsLoading(false); 
      return; 
    }
    try {
      const [resMe, resProfiles] = await Promise.all([
        apiFetch(API.AUTH.ME),
        API.PROFILES.list().catch(() => ({ data: [] }))
      ]);
      
      setUser(resMe.data);
      
      const userProfiles = resProfiles?.data || resProfiles || [];
      setProfiles(Array.isArray(userProfiles) ? userProfiles : []);

      // Restore active profile
      const savedProfileId = localStorage.getItem('nexo_active_profile_id');
      if (savedProfileId && Array.isArray(userProfiles)) {
        const found = userProfiles.find((p: any) => p.id === savedProfileId);
        if (found) {
          setActiveProfileState(found);
        } else {
          localStorage.removeItem('nexo_active_profile_id');
          setActiveProfileState(null);
        }
      }
    } catch (error: any) {
      if (error?.status === 401) {
        localStorage.removeItem('nexo_access_token');
        localStorage.removeItem('nexo_refresh_token');
        localStorage.removeItem('nexo_active_profile_id');
        setUser(null);
        setProfiles([]);
        setActiveProfileState(null);
      }
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

  const login = async (identifier: string, password: string) => {
    const res = await apiFetch(API.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
    localStorage.setItem('nexo_access_token', res.data.accessToken);
    localStorage.setItem('nexo_refresh_token', res.data.refreshToken);
    setUser(res.data.user);
    await refreshUser(); // Fetch profiles after login
  };

  const register = async (data: { username?: string; email?: string; password: string; name?: string; asGuest?: boolean }) => {
    const res = await apiFetch(API.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    localStorage.setItem('nexo_access_token', res.data.accessToken);
    localStorage.setItem('nexo_refresh_token', res.data.refreshToken);
    setUser(res.data.user);
    await refreshUser();
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('nexo_refresh_token');
    if (refreshToken) {
      apiFetch(API.AUTH.LOGOUT, { method: 'POST', body: JSON.stringify({ refreshToken }) }).catch(() => {});
    }
    localStorage.removeItem('nexo_access_token');
    localStorage.removeItem('nexo_refresh_token');
    localStorage.removeItem('nexo_active_profile_id');
    setUser(null);
    setProfiles([]);
    setActiveProfileState(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      profiles,
      activeProfile,
      isLoading,
      isLoggedIn: !!user,
      isSubscriber: !!(
        user?.subscription?.status === 'ACTIVE' &&
        user?.subscription?.plan?.canWatch &&
        new Date(user.subscription.expiresAt) > new Date()
      ),
      isAdmin: user?.role === 'ADMIN',
      isReseller: user?.role === 'RESELLER' || user?.role === 'ADMIN',
      isFranchisee: user?.role === 'FRANCHISEE' || user?.role === 'ADMIN',
      showAds: !user ? true : (['ADMIN', 'RESELLER', 'FRANCHISEE'].includes(user.role) ? false : (user.subscription?.status === 'ACTIVE' && new Date(user.subscription.expiresAt) > new Date() ? !!user.subscription.plan?.showAds : true)),
      login,
      register,
      logout,
      refreshUser,
      setActiveProfile,
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
