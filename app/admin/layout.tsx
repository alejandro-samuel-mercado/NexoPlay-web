'use client';
import "./admin.css";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, Film, Key, Crown, Settings, ArrowLeft,
  Bell, Coins, TrendingUp, Code2, Store, ShieldCheck, BarChart3, Building2, MessageCircleHeart
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// All nav items for ADMIN
const ADMIN_NAV_ITEMS = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { href: '/admin/usuarios', icon: Users, label: 'Usuarios' },
  { href: '/admin/contenido', icon: Film, label: 'Contenido' },
  { href: '/admin/planes', icon: Crown, label: 'Planes' },
  { href: '/admin/tokens', icon: Coins, label: 'Tokens' },
  { href: '/admin/social/metricas', icon: MessageCircleHeart, label: 'Nuba Social' },
  { href: '/admin/codigos', icon: Key, label: 'Códigos' },
  { href: '/admin/ads', icon: TrendingUp, label: 'Publicidad' },
  { href: '/admin/tenant', icon: Building2, label: 'Franquicias' },
  { href: '/admin/api-keys', icon: Code2, label: 'API Pública' },
  { href: '/admin/notificaciones', icon: Bell, label: 'Notificaciones' },
  { href: '/admin/configuracion', icon: Settings, label: 'Configuración' },
];

// Limited nav for FRANCHISEE
const FRANCHISEE_NAV_ITEMS = [
  { href: '/admin', icon: LayoutDashboard, label: 'Mi Dashboard', exact: true },
  { href: '/admin/tenant', icon: Store, label: 'Mi Tienda' },
  { href: '/admin/tenant/dashboard', icon: BarChart3, label: 'Estadísticas' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isAdmin, isFranchisee, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAdmin && !isFranchisee) {
      router.push('/');
    }
  }, [isLoading, isAdmin, isFranchisee, router]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[100] bg-[var(--bg-main)] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  const navItems = isAdmin ? ADMIN_NAV_ITEMS : FRANCHISEE_NAV_ITEMS;
  const roleColor = isAdmin ? 'var(--clay-red)' : '#60A5FA';
  const roleBg = isAdmin ? 'rgba(220,38,38,0.15)' : 'rgba(96,165,250,0.15)';
  const roleBadge = isAdmin ? 'ADMIN' : 'FRANQUICIADO';
  const panelLabel = isAdmin ? 'Panel Admin Global' : 'Panel Franquiciado';

  return (
    <div className="serivia-layout">
      {/* Desktop Sidebar */}
      <aside
        className="w-60 flex-shrink-0 border-r border-[var(--border-subtle)] hidden md:flex flex-col bg-[var(--bg-panel)] backdrop-blur-3xl z-50 relative"
      >
        {/* Logo + role label */}
        <div className="p-5 border-b border-[#1E1E3A]">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-8 h-8 rounded-[8px] border border-white/10 flex items-center justify-center text-sm font-black text-white shadow-lg"
              style={{ background: roleColor }}
            >
              N
            </div>
            <span className="font-black text-white" style={{ fontFamily: 'Space Grotesk' }}>
              <span style={{ color: roleColor }}>Nexo</span>Play
            </span>
          </div>
          <div
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest"
            style={{ background: roleBg, color: roleColor }}
          >
            <ShieldCheck size={12} />
            {panelLabel}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-bold transition-all group ${
                  isActive ? 'text-white shadow-md' : 'text-[#8B8FA8] hover:text-white hover:bg-white/5'
                }`}
                style={
                  isActive
                    ? { background: roleColor }
                    : {}
                }
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User info + back link */}
        <div className="p-3 border-t border-[var(--border-subtle)] space-y-2">
          <div className="px-3 py-2.5 rounded-[10px] flex items-center gap-2.5" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div
              className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden border-2"
              style={{ borderColor: roleColor }}
            >
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.email || 'admin')}`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-white truncate">{user?.name || user?.email}</p>
              <span
                className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md inline-block"
                style={{ background: roleBg, color: roleColor }}
              >
                {roleBadge}
              </span>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-[10px] text-xs font-bold transition-all hover:bg-white/5"
            style={{ color: '#6B7280' }}
          >
            <ArrowLeft size={14} /> Volver al sitio
          </Link>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-50 border-b border-[var(--border-subtle)] px-4 py-3 flex items-center justify-between bg-[var(--bg-panel)] backdrop-blur-md"
      >
        <span className="font-black text-white text-sm" style={{ fontFamily: 'Space Grotesk' }}>
          <span style={{ color: roleColor }}>Nexo</span>Play{' '}
          <span className="text-xs font-bold" style={{ color: '#6B7280' }}>{panelLabel}</span>
        </span>
        {/* Mobile nav: horizontal scrollable */}
        <div className="flex gap-1 overflow-x-auto max-w-xs hide-scrollbar">
          {navItems.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-shrink-0 p-2 rounded-[8px] transition-all shadow-sm ${isActive ? 'text-white' : 'text-[#8B8FA8]'}`}
                style={
                  isActive
                    ? { background: roleColor }
                    : {}
                }
              >
                <Icon size={18} />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <main className="serivia-main-content md:mt-0 mt-14">
        <div className="w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
