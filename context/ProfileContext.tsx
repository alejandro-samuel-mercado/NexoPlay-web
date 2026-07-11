'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { API, apiFetch } from '@/lib/api';
import { useAuth } from './AuthContext';

export interface NexoProfile {
  id: string;
  name: string;
  avatarUrl: string | null;
  isKids: boolean;
  pinCode: string | null;
}

interface ProfileContextType {
  profiles: NexoProfile[];
  activeProfile: NexoProfile | null;
  isLoading: boolean;
  setActiveProfile: (profile: NexoProfile | null) => void;
  refreshProfiles: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user, isLoggedIn } = useAuth();
  const [profiles, setProfiles] = useState<NexoProfile[]>([]);
  const [activeProfile, setActiveProfileState] = useState<NexoProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshProfiles = async () => {
    if (!isLoggedIn) {
      setProfiles([]);
      setActiveProfileState(null);
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await apiFetch(API.PROFILES.list());
      setProfiles(res.data);
      
      // Auto-select if there's an active profile saved in localStorage, or if only 1 exists
      const savedProfileId = localStorage.getItem('nexo_active_profile');
      if (savedProfileId) {
        const found = res.data.find((p: NexoProfile) => p.id === savedProfileId);
        if (found) setActiveProfileState(found);
        else setActiveProfileState(null);
      } else if (res.data.length === 1) {
        setActiveProfileState(res.data[0]);
        localStorage.setItem('nexo_active_profile', res.data[0].id);
      }
    } catch (e) {
      console.error('Failed to load profiles:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProfiles();
  }, [isLoggedIn, user]);

  const setActiveProfile = (profile: NexoProfile | null) => {
    setActiveProfileState(profile);
    if (profile) {
      localStorage.setItem('nexo_active_profile', profile.id);
    } else {
      localStorage.removeItem('nexo_active_profile');
    }
  };

  return (
    <ProfileContext.Provider value={{
      profiles,
      activeProfile,
      isLoading,
      setActiveProfile,
      refreshProfiles,
    }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider');
  return ctx;
}
