'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, BarChart3, Coins, Download, History, LayoutDashboard, Package } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const RESELLER_NAV_ITEMS = [
  { href: '/reseller/dashboard', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { href: '/reseller/dashboard#catalog', icon: Download, label: 'Catálogo & Descargas' },
  { href: '/reseller/dashboard#pack', icon: Package, label: 'Pack Semanal' },
  { href: '/reseller/dashboard#tokens', icon: Coins, label: 'Mis Tokens' },
];

export default function ResellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isReseller, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isReseller) {
      router.push('/');
    }
  }, [isLoading, isReseller, router]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[100] bg-[var(--bg-main)] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!user || !isReseller) return null;

  return (
    <div className="serivia-layout">
      {/* Desktop Sidebar */}
      <aside
        className="w-60 flex-shrink-0 border-r border-[var(--border-subtle)] hidden md:flex flex-col bg-[var(--bg-panel)] backdrop-blur-3xl z-50 relative"
      >
        {/* Logo + role label */}
        <div className="p-5 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-8 h-8 rounded-[8px] border border-white/10 flex items-center justify-center text-sm font-black shadow-lg"
              style={{ background: '#34D399', color: '#0a0f0a' }}
            >
              R
            </div>
            <span className="font-black text-white" style={{ fontFamily: 'Space Grotesk' }}>
              <span style={{ color: '#34D399' }}>Nexo</span>Play
            </span>
          </div>
          <div
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest"
            style={{ background: 'rgba(52,211,153,0.12)', color: '#34D399' }}
          >
            <Download size={11} />
            Panel Revendedor B2B
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {RESELLER_NAV_ITEMS.map((item) => {
            const isActive = item.exact
              ? pathname === item.href.split('#')[0]
              : pathname.startsWith(item.href.split('#')[0]);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-bold transition-all group ${
                  isActive ? 'text-[#0a0f0a] shadow-md' : 'text-[#8B8FA8] hover:text-white hover:bg-white/5'
                }`}
                style={
                  isActive
                    ? { background: '#34D399' }
                    : {}
                }
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Stats widget */}
        <div className="px-4 pb-2">
          <div
            className="p-3 rounded-[12px] border"
            style={{ background: 'rgba(52,211,153,0.05)', borderColor: 'rgba(52,211,153,0.2)' }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#34D399' }}>
              Suscripción B2B
            </p>
            <p className="text-xs text-white font-bold">Plan Revendedor</p>
            <p className="text-[10px] mt-0.5" style={{ color: '#8B8FA8' }}>30 descargas/día</p>
          </div>
        </div>

        {/* User info + back link */}
        <div className="p-3 border-t border-[var(--border-subtle)] space-y-2">
          <div className="px-3 py-2.5 rounded-[10px] flex items-center gap-2.5" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden border-2" style={{ borderColor: '#34D399' }}>
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email)}`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-white truncate">{user.name || user.email}</p>
              <span
                className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md inline-block"
                style={{ background: 'rgba(52,211,153,0.12)', color: '#34D399' }}
              >
                REVENDEDOR
              </span>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-[10px] text-xs font-bold transition-all hover:bg-white/5"
            style={{ color: '#6B7280' }}
          >
            <ArrowLeft size={14} /> Volver al catálogo
          </Link>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-50 border-b border-[var(--border-subtle)] px-4 py-3 flex items-center justify-between bg-[var(--bg-panel)] backdrop-blur-md"
      >
        <span className="font-black text-sm" style={{ fontFamily: 'Space Grotesk', color: '#34D399' }}>
          Panel Revendedor
        </span>
        <div className="flex gap-1">
          {RESELLER_NAV_ITEMS.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href.split('#')[0];
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`p-2 rounded-[8px] transition-all shadow-sm ${isActive ? 'text-[#0a0f0a]' : 'text-[#8B8FA8]'}`}
                style={isActive ? { background: '#34D399' } : {}}
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
