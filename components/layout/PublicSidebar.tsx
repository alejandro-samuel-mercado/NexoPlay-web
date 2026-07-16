'use client';

import { useAuth } from '@/context/AuthContext';
import { API_ROUTES, resolveImageUrl } from '@/lib/api-routes';
import { Clapperboard, Clock, Flame, Heart, Home, Play, Settings, Sparkles, TrendingUp, Video } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PublicSidebar() {
  const pathname = usePathname();
  const { user, isAdmin, isReseller } = useAuth();
  const [continueWatching, setContinueWatching] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      setContinueWatching([]);
      return;
    }
    const fetchHistory = async () => {
      const token = localStorage.getItem('accessToken');
      const profileId = localStorage.getItem('nexo_active_profile_id');
      if (!token || !profileId) return;
      try {
        const r = await fetch(`${API_ROUTES.HISTORY.BASE}/continue`, {
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
    { name: 'Favoritos', icon: Heart, path: '/favoritos' },
    { name: 'Estrenos', icon: Sparkles, path: '/explorar?quick=premieres' },
    { name: 'Tendencias', icon: TrendingUp, path: '/explorar?quick=trending' },
    { name: 'Recién Agregados', icon: Clock, path: '/explorar?quick=latest' },
  ];

  // Extra section based on role
  const getRoleSection = () => {
    if (isAdmin) return { name: 'Panel Admin', icon: Settings, path: '/admin' };
    if (isReseller) return { name: 'Panel Revendedor', icon: Video, path: '/reseller/dashboard' };
    return null;
  };
  const roleItem = getRoleSection();

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
        <span className="text-[22px] font-bold text-[var(--text-main)] lowercase tracking-tight ml-1">serivia</span>
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
            const img = resolveImageUrl(c.thumbnails?.find((t: any) => t.type === 'BACKDROP')?.url);
            const percentage = history.duration ? Math.min(100, Math.round((history.progress / history.duration) * 100)) : 0;
            const remainingMins = history.duration ? Math.round((history.duration - history.progress) / 60) : 0;

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
                    <span className="text-[10px] text-white font-bold">{percentage}%</span>
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
      <nav className="px-4 space-y-1 mt-auto">
        {/* Historial — solo si logueado */}
        {user && (
          <Link
            href="/historial"
            className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 font-bold text-sm tracking-wide ${
              pathname === '/historial'
                ? 'bg-white/10 text-[var(--text-main)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-white/5'
            }`}
            style={{ textDecoration: 'none' }}
          >
            <Clock size={20} className={pathname === '/historial' ? 'text-[var(--color-primary)]' : ''} />
            Historial
          </Link>
        )}

        {/* Rol-specific link */}
        {user && roleItem && (
          <Link
            href={roleItem.path}
            className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 font-bold text-sm tracking-wide ${
              pathname.startsWith(roleItem.path)
                ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-white/5'
            }`}
            style={{ textDecoration: 'none' }}
          >
            <roleItem.icon size={20} />
            {roleItem.name}
          </Link>
        )}

        {/* Configuración */}
        <Link
          href="/configuracion"
          className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 font-bold text-sm tracking-wide ${
            pathname === '/configuracion'
              ? 'bg-white/10 text-[var(--text-main)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-white/5'
          }`}
          style={{ textDecoration: 'none' }}
        >
          <Settings size={20} className={pathname === '/configuracion' ? 'text-[var(--color-primary)]' : ''} />
          Configuración
        </Link>
      </nav>
    </aside>
  );
}
