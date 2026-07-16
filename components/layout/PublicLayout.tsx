'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';
import PublicSidebar from './PublicSidebar';
import PublicTopBar from './PublicTopBar';
import MobileBottomNav from './MobileBottomNav';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading, activeProfile, profiles } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      if (isLoggedIn && !activeProfile) {
        // Ignorar redirección si ya estamos en páginas donde no se necesita o ya estamos en perfiles
        const ignoredPaths = ['/perfiles', '/auth/login', '/auth/registro'];
        if (!ignoredPaths.includes(pathname)) {
          router.replace('/perfiles');
          return;
        }
      }
      setCheckingProfile(false);
    }
  }, [isLoggedIn, isLoading, activeProfile, pathname, router]);

  if (isLoading || checkingProfile) {
    return (
      <div className="fixed inset-0 z-[100] bg-[var(--bg-main)] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[var(--color-primary)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="serivia-layout">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block z-50">
        <PublicSidebar />
      </div>

      {/* Main Content Area */}
      <div className="serivia-main-content overflow-x-hidden">
        <PublicTopBar />
        {/* pb-20 on mobile for BottomNav */}
        <main className="flex-1 pb-24 lg:pb-12">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
