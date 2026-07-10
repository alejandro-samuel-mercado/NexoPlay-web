'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Heart, Calendar, TrendingUp, Settings, HelpCircle, Play } from 'lucide-react';
import { API, apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function PublicSidebar() {
  const pathname = usePathname();
  const { isLoggedIn } = useAuth();
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    if (isLoggedIn) {
      apiFetch(API.DOWNLOADS.HISTORY)
        .then(res => {
          if (res.success && res.data) {
            setHistory(res.data.slice(0, 3)); // Only show top 3 recent
          }
        })
        .catch(console.error);
    }
  }, [isLoggedIn]);

  const menu = [
    { name: 'Home', icon: Home, href: '/' },
    { name: 'Favorites', icon: Heart, href: '/mi-lista' },
    { name: 'Coming soon', icon: Calendar, href: '/explorar?sort=upcoming' },
    { name: 'Trending', icon: TrendingUp, href: '/explorar?sort=popular' },
  ];

  const bottomMenu = [
    { name: 'Settings', icon: Settings, href: '/perfil' },
    { name: 'Support', icon: HelpCircle, href: '/soporte' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[var(--bg-sidebar)] border-r border-[#1C1C22] flex flex-col pt-8 pb-6 overflow-y-auto hide-scrollbar z-50">
      {/* Logo */}
      <Link href="/" className="px-8 flex items-center gap-3 mb-12">
        <div className="w-8 h-8 rounded-lg bg-[#FFD700] flex items-center justify-center">
          <Play size={16} fill="black" className="text-black ml-1" />
        </div>
        <span className="text-xl font-bold text-white tracking-tight">Serivia</span>
      </Link>

      {/* Main Menu */}
      <div className="flex-1 px-4 space-y-1">
        {menu.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-medium ${
                isActive ? 'bg-[var(--bg-panel)] text-[var(--text-main)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-panel)]/50'
              }`}>
              <Icon size={20} className={isActive ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'} />
              {item.name}
            </Link>
          );
        })}

        {/* Divider */}
        <div className="h-px bg-[var(--border-subtle)] my-6 mx-4" />

        {/* Bottom Menu */}
        {bottomMenu.map((item) => (
          <Link key={item.name} href={item.href}
            className="flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-panel)]/50">
            <item.icon size={20} />
            {item.name}
          </Link>
        ))}
      </div>

      {/* Continue Watching / Recent History */}
      <div className="px-8 mt-12 mb-4">
        <h3 className="text-sm font-semibold text-[var(--text-muted)] mb-4">Continuar Viendo</h3>
        <div className="space-y-3">
          {history.length > 0 ? (
            history.map((item, idx) => (
              <Link key={idx} href={`/contenido/${item.content?.slug || ''}`} className="relative block rounded-2xl overflow-hidden group cursor-pointer h-24">
                <img src={item.content?.backdropUrl || item.content?.posterUrl || 'https://image.tmdb.org/t/p/w500/AHO3Q44E41P0m34pD8I8T4Rz81f.jpg'} alt={item.content?.title || 'Contenido'} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <div>
                    <p className="text-xs font-bold text-white mb-1">{item.content?.title || 'Desconocido'}</p>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                        <Play size={10} fill="white" className="ml-0.5" />
                      </div>
                      <span className="text-[10px] text-gray-300">Descargado</span>
                    </div>
                  </div>
                  <div className="bg-black/50 backdrop-blur-md rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-white">100%</div>
                </div>
              </Link>
            ))
          ) : (
            <>
              {/* Mockup Fallback */}
              <div className="relative rounded-2xl overflow-hidden group cursor-pointer h-24">
                <img src="https://image.tmdb.org/t/p/w500/AHO3Q44E41P0m34pD8I8T4Rz81f.jpg" alt="Arcane" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <div>
                    <p className="text-xs font-bold text-white mb-1">Arcane</p>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                        <Play size={10} fill="white" className="ml-0.5" />
                      </div>
                      <span className="text-[10px] text-gray-300">S1:E6</span>
                    </div>
                  </div>
                  <div className="bg-black/50 backdrop-blur-md rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-white">55%</div>
                </div>
              </div>
              <div className="relative rounded-2xl overflow-hidden group cursor-pointer h-24">
                <img src="https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg" alt="Blade Runner" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <div>
                    <p className="text-xs font-bold text-white mb-1">Blade Runner 2049</p>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                        <Play size={10} fill="white" className="ml-0.5" />
                      </div>
                      <span className="text-[10px] text-gray-300">1h 25min</span>
                    </div>
                  </div>
                  <div className="bg-black/50 backdrop-blur-md rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-white">55%</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
