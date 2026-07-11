'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Film, Key, Crown, Settings, ArrowLeft, Bell, Coins } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const NAV_ITEMS = [
  { href: '/admin', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { href: '/admin/usuarios', icon: <Users size={18} />, label: 'Usuarios' },
  { href: '/admin/contenido', icon: <Film size={18} />, label: 'Contenido' },
  { href: '/admin/codigos', icon: <Key size={18} />, label: 'Códigos' },
  { href: '/admin/planes', icon: <Crown size={18} />, label: 'Planes' },
  { href: '/admin/tokens', icon: <Coins size={18} />, label: 'Tokens' },
  { href: '/admin/notificaciones', icon: <Bell size={18} />, label: 'Avisos Push' },
  { href: '/admin/configuracion', icon: <Settings size={18} />, label: 'Configuración' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 border-r border-[#3A3A5C] hidden md:flex flex-col"
        style={{ background: '#12122A' }}>
        {/* Logo */}
        <div className="p-5 border-b border-[#3A3A5C]">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-[8px] border-[2px] border-[#2C2C2C] flex items-center justify-center text-sm font-black text-white"
              style={{ background: 'var(--clay-red)', boxShadow: '2px 2px 0px #2C2C2C' }}>N</div>
            <span className="font-black text-white" style={{ fontFamily: 'Space Grotesk' }}>
              <span style={{ color: 'var(--clay-red)' }}>Nexo</span>Play
            </span>
          </div>
          <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">Panel Admin</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-bold transition-all ${isActive ? 'text-[var(--clay-ink)]' : 'text-[#A8B3C8] hover:text-white hover:bg-white/5'}`}
                style={isActive ? { background: 'var(--clay-teal)', boxShadow: '2px 2px 0px #2C2C2C', border: '2px solid #2C2C2C' } : {}}>
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User + Back */}
        <div className="p-3 border-t border-[#3A3A5C] space-y-2">
          <div className="px-3 py-2 rounded-[10px] bg-white/5">
            <p className="text-xs font-bold text-white truncate">{user?.name || user?.email}</p>
            <span className="clay-badge text-[10px]" style={{ color: 'var(--clay-teal)', borderColor: 'var(--clay-teal)' }}>ADMIN</span>
          </div>
          <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-[10px] text-xs font-bold text-[#6B7280] hover:text-white hover:bg-white/5 transition-all">
            <ArrowLeft size={14} /> Volver al sitio
          </Link>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 border-b border-[#3A3A5C] px-4 py-3 flex items-center justify-between"
        style={{ background: '#12122A' }}>
        <span className="font-black text-white text-sm" style={{ fontFamily: 'Space Grotesk' }}>
          <span style={{ color: 'var(--clay-red)' }}>Nexo</span>Play Admin
        </span>
        {/* Mobile nav: horizontal scrollable */}
        <div className="flex gap-2 overflow-x-auto max-w-xs">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href}
              className="flex-shrink-0 p-2 rounded-[8px] text-[#A8B3C8] hover:text-white hover:bg-white/5 transition-all"
              style={pathname.startsWith(item.href) ? { background: 'var(--clay-teal)', color: 'var(--clay-ink)' } : {}}>
              {item.icon}
            </Link>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto md:mt-0 mt-14">
        {children}
      </main>
    </div>
  );
}
