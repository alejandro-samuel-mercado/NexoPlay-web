'use client';

import { useAuth } from '@/context/AuthContext';
import { Coins, Download, LayoutDashboard, LogOut, Package, ShieldCheck, Users, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const C = '#34D399';
const CB = 'rgba(52,211,153,0.15)';

export default function ResellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  const isLoginPage = pathname === '/reseller/login';

  useEffect(() => {
    if (isLoginPage) return;
    if (!isLoading) {
      if (!user) router.replace('/reseller/login');
      else if (!['RESELLER', 'SUPER_RESELLER', 'ADMIN_RESELLER'].includes(user.role)) router.replace('/reseller/login?error=no-access');
    }
  }, [isLoading, user, router, isLoginPage]);

  if (isLoginPage) return <>{children}</>;

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[100] bg-[var(--bg-main)] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: C, borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!user || !['RESELLER', 'SUPER_RESELLER', 'ADMIN_RESELLER'].includes(user.role)) return null;

  const handleLogout = async () => { await logout(); router.replace('/reseller/login'); };

  const canSeeResellers = user.role === 'SUPER_RESELLER' || user.role === 'ADMIN_RESELLER';

  const RESELLER_NAV = [
    { href: '/reseller', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { 
      href: '/reseller/usuarios', 
      icon: Users, 
      label: 'Mis Clientes',
      subItems: [
        ...(canSeeResellers ? [{ href: '/reseller/usuarios?tab=Resellers', label: 'Revendedores' }] : []),
        { href: '/reseller/usuarios?tab=Clients', label: 'Suscriptores' },
      ]
    },
    { href: '/reseller/descargas', icon: Download, label: 'Descargas' },
    { href: '/reseller/pack', icon: Package, label: 'Pack Semanal' },
    { href: '/reseller/tokens', icon: Coins, label: 'Créditos' },
  ];

  return (
    <div className="serivia-layout">
      {/* Desktop Sidebar */}
      <aside className="w-60 flex-shrink-0 border-r border-[var(--border-subtle)] hidden md:flex flex-col bg-[var(--bg-panel)] backdrop-blur-3xl z-50 relative">
        <div className="p-5 border-b border-[#1E1E3A]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-[8px] border border-white/10 flex items-center justify-center text-sm font-black text-[#0a0f0a] shadow-lg" style={{ background: C }}>R</div>
            <span className="font-black text-white" style={{ fontFamily: 'Space Grotesk' }}><span style={{ color: C }}></span>Vexa</span>
          </div>
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest" style={{ background: CB, color: C }}>
            <ShieldCheck size={12} /> Panel Revendedor B2B
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {RESELLER_NAV.map((item) => {
            const isPathActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const isExpanded = item.subItems ? (expandedMenus[item.href] !== undefined ? expandedMenus[item.href] : isPathActive) : false;
            const Icon = item.icon;

            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  onClick={(e) => {
                    if (item.subItems) {
                      if (isPathActive) {
                        e.preventDefault();
                        setExpandedMenus(prev => ({ ...prev, [item.href]: !isExpanded }));
                      } else {
                        setExpandedMenus(prev => ({ ...prev, [item.href]: true }));
                      }
                    }
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-bold transition-all group ${
                    isPathActive ? 'text-white shadow-md' : 'text-[#8B8FA8] hover:text-white hover:bg-white/5'
                  }`}
                  style={isPathActive && !item.subItems ? { background: C, color: '#0a0f0a' } : {}}
                >
                  <Icon size={17} />
                  <span className="flex-1">{item.label}</span>
                  {item.subItems && (
                    <ChevronDown size={14} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  )}
                </Link>

                {item.subItems && isExpanded && (
                  <div className="mt-1 ml-4 border-l-2 border-white/5 pl-2 space-y-1">
                    {item.subItems.map(subItem => {
                      const search = typeof window !== 'undefined' ? window.location.search : '';
                      const currentFull = pathname + search;
                      const isSubActive = currentFull.includes(subItem.href.split('?')[1] || '') && pathname === subItem.href.split('?')[0];
                      
                      return (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={`block px-3 py-2 text-xs font-bold rounded-lg transition-colors ${
                            isSubActive ? 'bg-white/10 text-white' : 'text-[#8B8FA8] hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {subItem.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[var(--border-subtle)] space-y-2">
          <div className="px-3 py-2.5 rounded-[10px] flex items-center gap-2.5" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden border-2" style={{ borderColor: C }}>
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.username || user.email)}`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-white truncate">{user.name || user.username || user.email}</p>
              <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md inline-block" style={{ background: CB, color: C }}>{user.role}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-[10px] text-xs font-bold transition-all hover:bg-white/5" style={{ color: '#FF6B6B' }}>
            <LogOut size={14} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 border-b border-[var(--border-subtle)] px-4 py-3 flex items-center justify-between bg-[var(--bg-panel)] backdrop-blur-md">
        <span className="font-black text-sm" style={{ fontFamily: 'Space Grotesk', color: C }}>Panel Revendedor</span>
        <div className="flex gap-1 overflow-x-auto hide-scrollbar">
          {RESELLER_NAV.map(({ href, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href}
                className={`flex-shrink-0 p-2 rounded-[8px] transition-all ${active ? 'text-[#0a0f0a]' : 'text-[#8B8FA8]'}`}
                style={active ? { background: C } : {}}>
                <Icon size={18} />
              </Link>
            );
          })}
        </div>
      </div>

      <main className="serivia-main-content md:mt-0 mt-14">
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
}
