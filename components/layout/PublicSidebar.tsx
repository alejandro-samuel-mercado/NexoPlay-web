'use client';

import { useAuth } from '@/context/AuthContext';
import { API_ROUTES, resolveImageUrl } from '@/lib/api-routes';
import {
  Clapperboard, Clock, Flame, Heart, Home, LogIn, LogOut,
  Play, Settings, Sparkles, Store, TrendingUp, Video, ShieldCheck, Star, Wallet
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PublicSidebar() {
  const pathname = usePathname();
  const { user, isAdmin, isReseller, isFranchisee, logout } = useAuth();
  const [continueWatching, setContinueWatching] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      setContinueWatching([]);
      return;
    }
    const fetchHistory = async () => {
      const token = localStorage.getItem('nexo_access_token');
      const profileId = localStorage.getItem('nexo_active_profile_id');
      if (!token || !profileId) return;
      try {
        const r = await fetch(API_ROUTES.HISTORY.CONTINUE, {
          headers: { 'Authorization': `Bearer ${token}`, 'X-Profile-Id': profileId }
        });
        const res = await r.json();
        if (res.success && res.data?.length > 0) {
          setContinueWatching(res.data.slice(0, 3));
        }
      } catch (e) {}
    };
    fetchHistory();
  }, [user]);

  const mainNavItems = [
    { name: 'Inicio', icon: Home, path: '/' },
    { name: 'Películas', icon: Clapperboard, path: '/explorar?type=MOVIE' },
    { name: 'Series', icon: Play, path: '/explorar?type=SERIES' },
    { name: 'Animes', icon: Flame, path: '/explorar?type=ANIME' },
    { name: 'Estrenos', icon: Sparkles, path: '/explorar?quick=premieres' },
    { name: 'Recién Agregados', icon: Clock, path: '/explorar?quick=latest' },
    { name: 'Favoritos', icon: Heart, path: '/favoritos' },
  ];

  // Role-specific panel item with distinct styling
  const getRoleItem = () => {
    if (user) return {
      name: user.role === 'GUEST' ? 'Panel Invitado' : 'Panel de Cuenta',
      icon: Wallet,
      path: '/panel',
      color: '#4ECDC4',
      bg: 'rgba(78,205,196,0.12)',
      badge: user.role === 'GUEST' ? 'INVITADO' : 'SUSCRIPTOR',
    };
    return null;
  };
  const roleItem = getRoleItem();

  const isActiveLink = (path: string) => {
    const base = path.split('?')[0];
    const query = path.includes('?') ? path.split('?')[1] : null;
    if (query) {
      return pathname === base && (typeof window !== 'undefined' && window.location.search === `?${query}`);
    }
    return pathname === base;
  };

  return (
    <aside className="sticky left-0 top-[1.5vh] h-[calc(100vh-3vh)] w-[250px] bg-transparent flex flex-col pt-8 pb-6 overflow-y-auto hide-scrollbar z-40 border-r border-white/5 shrink-0">
      
      {/* Logo */}
      <Link href="/" className="px-8 flex items-center gap-2 mb-10 text-decoration-none">
        <div className="flex items-center gap-0.5">
          <div className="w-3.5 h-5 rounded-sm bg-[#FFD700] flex flex-col items-center justify-evenly py-0.5">
            <div className="w-1 h-1 rounded-full bg-black/60"></div>
            <div className="w-1 h-1 rounded-full bg-black/60"></div>
          </div>
          <div className="w-3.5 h-5 rounded-sm bg-[#FFD700] flex flex-col items-center justify-evenly py-0.5">
            <div className="w-1 h-1 rounded-full bg-black/60"></div>
            <div className="w-1 h-1 rounded-full bg-black/60"></div>
          </div>
        </div>
        <span className="text-[22px] font-bold text-[var(--text-main)] upercase tracking-tight ml-1">Vexa</span>
      </Link>

      {/* Menú Principal */}
      <nav className="flex-1 px-4 space-y-1 mb-4">
        {mainNavItems.map((item) => {
          const active = isActiveLink(item.path);
          return (
            <Link 
              key={item.name} 
              href={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 font-bold text-sm tracking-wide ${
                active 
                  ? 'bg-white/10 text-[var(--text-main)]' 
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-white/5'
              }`}
              style={{ textDecoration: 'none' }}
            >
              <item.icon size={20} className={active ? 'text-[var(--color-primary)]' : ''} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Continuar Viendo — SOLO SI ESTÁ LOGUEADO y tiene datos reales */}
      {user && continueWatching.length > 0 && (
        <div className="px-6 mb-6 flex flex-col gap-3">
          <span className="px-2 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 flex items-center gap-2">
            <Clapperboard size={14} /> Continuar Viendo
          </span>
          
          {continueWatching.map(history => {
            const c = history.content;
            if (!c) return null;
            const title = c.translations?.[0]?.title || c.slug;
            const img = resolveImageUrl(c.thumbnails?.find((t: any) => t.type === 'POSTER' || t.type === 'BACKDROP')?.url);
            const percentage = history.durationSeconds ? Math.min(100, Math.round((history.progressSeconds / history.durationSeconds) * 100)) : 0;
            const remainingMins = history.durationSeconds ? Math.round((history.durationSeconds - history.progressSeconds) / 60) : 0;

            return (
              <Link href={`/film/${c.slug}`} key={history.id} className="continue-card">
                {img && <img src={img} alt={title} className="continue-bg" />}
                <div className="continue-overlay" />
                <div className="continue-content">
                  <span className="continue-title">{title}</span>
                  <div className="flex items-end justify-between w-full">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center">
                        <Play size={10} fill="currentColor" />
                      </div>
                      <span className="text-[10px] text-white/80 font-semibold">{remainingMins}m restantes</span>
                    </div>
                
                  </div>
                  <div className="continue-progress-bar absolute bottom-0 left-0">
                    <div className="continue-progress-fill" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Sección Sistema */}
      <nav className="px-4 space-y-1">


        {/* Panel según rol — destacado visualmente */}
        {user && roleItem && (
          <Link
            href={roleItem.path}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 font-bold text-sm mt-1 group"
            style={{
              background: pathname.startsWith(roleItem.path.split('?')[0]) ? roleItem.bg : 'transparent',
              color: pathname.startsWith(roleItem.path.split('?')[0]) ? roleItem.color : 'var(--text-muted)',
              textDecoration: 'none',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = roleItem.bg;
              (e.currentTarget as HTMLElement).style.color = roleItem.color;
            }}
            onMouseLeave={e => {
              if (!pathname.startsWith(roleItem.path.split('?')[0])) {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
                (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
              }
            }}
          >
            <roleItem.icon size={20} />
            <span className="flex-1">{roleItem.name}</span>
            <span
              className="text-[9px] font-black px-1.5 py-0.5 rounded-md"
              style={{ background: roleItem.color, color: '#0a0a0f' }}
            >
              {roleItem.badge}
            </span>
          </Link>
        )}

       
      </nav>

      {/* Remove User info / Login CTA */}
    </aside>
  );
}
