'use client';

import { useAuth } from '@/context/AuthContext';
import { Coins, Download, LayoutDashboard, LogOut, Package, ShieldCheck, Users, ChevronDown, Film, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const C = '#34D399';
const CB = 'rgba(52,211,153,0.15)';

export default function ResellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    ...(canSeeResellers 
      ? [
          { href: '/reseller/usuarios?tab=Resellers', icon: Users, label: 'Revendedores' },
          { href: '/reseller/usuarios?tab=Clients', icon: Users, label: 'Clientes Finales' }
        ]
      : [
          { href: '/reseller/usuarios?tab=Clients', icon: Users, label: 'Mis Clientes' }
        ]
    ),
    ...(canSeeResellers ? [{ href: '/reseller/credit-packs', icon: Package, label: 'Packs de Créditos' }] : []),
     { href: '/reseller/contenido', icon: Film, label: 'Contenido' }
  ];

  const getIsActive = (item: any) => {
    if (item.exact) return pathname === item.href;
    const basePath = item.href.split('?')[0];
    if (!pathname.startsWith(basePath)) return false;
    
    if (item.href.includes('tab=')) {
      const targetTab = new URLSearchParams(item.href.split('?')[1]).get('tab');
      const currentTab = searchParams.get('tab');
      if (!currentTab) {
        const defaultTab = canSeeResellers ? 'Resellers' : 'Clients';
        return targetTab === defaultTab;
      }
      return currentTab === targetTab;
    }
    return true;
  };

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
          {RESELLER_NAV.map((item: any) => {
            const isPathActive = getIsActive(item);
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
                    {item.subItems.map((subItem: any) => {
                      // subItem.href is like '/reseller/usuarios?tab=Clients'
                      const isSubActive = searchParams.get('tab') ? subItem.href.includes(`tab=${searchParams.get('tab')}`) : (subItem.href.includes('tab=Resellers') && canSeeResellers) || (subItem.href.includes('tab=Clients') && !canSeeResellers);
                      
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
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 border-b border-[var(--border-subtle)] px-4 py-3 flex items-center justify-between bg-[var(--bg-panel)] backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[8px] flex items-center justify-center text-xs font-black text-[#0a0f0a]" style={{ background: C }}>R</div>
          <span className="font-black text-white text-sm" style={{ fontFamily: 'Space Grotesk' }}>Vexa</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md" style={{ background: CB, color: C }}>REVENDEDOR</span>
          <div className="w-8 h-8 rounded-full border border-white/20 overflow-hidden">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.username || user.email)}`} alt="Avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navbar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border-subtle)] bg-[var(--bg-panel)] backdrop-blur-xl pb-safe flex justify-around items-center px-2 py-2">
        {RESELLER_NAV.slice(0, 4).map((item: any) => {
          const isActive = getIsActive(item);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)} className={`flex flex-col items-center p-2 rounded-xl transition-all ${isActive ? 'text-white' : 'text-[#8B8FA8] hover:text-white'}`}>
              <Icon size={20} style={isActive ? { color: C } : {}} />
              <span className="text-[10px] mt-1 font-bold" style={isActive ? { color: C } : {}}>{item.label.length > 10 ? item.label.substring(0,10)+'...' : item.label}</span>
            </Link>
          );
        })}
        <button onClick={() => setMobileMenuOpen(true)} className={`flex flex-col items-center p-2 rounded-xl transition-all ${mobileMenuOpen ? 'text-white' : 'text-[#8B8FA8] hover:text-white'}`}>
          <Menu size={20} style={mobileMenuOpen ? { color: C } : {}} />
          <span className="text-[10px] mt-1 font-bold" style={mobileMenuOpen ? { color: C } : {}}>Menú</span>
        </button>
      </div>

      {/* Mobile Expandable Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-64 h-full bg-[var(--bg-panel)] border-l border-[var(--border-subtle)] shadow-2xl flex flex-col animate-slide-in-right">
            <div className="p-4 border-b border-[var(--border-subtle)] flex justify-between items-center bg-black/20">
              <span className="font-black text-white text-lg">Menú</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {RESELLER_NAV.map((item: any) => {
                const isPathActive = getIsActive(item);
                const isExpanded = item.subItems ? (expandedMenus[item.href] !== undefined ? expandedMenus[item.href] : isPathActive) : false;
                const Icon = item.icon;
                return (
                  <div key={item.href}>
                    <Link
                      href={item.href}
                      onClick={(e) => {
                        if (item.subItems) {
                          e.preventDefault();
                          setExpandedMenus(prev => ({ ...prev, [item.href]: !isExpanded }));
                        } else {
                          setMobileMenuOpen(false);
                        }
                      }}
                      className={`flex items-center gap-3 px-3 py-3 rounded-[10px] text-sm font-bold transition-all ${
                        isPathActive ? 'text-white bg-white/10 shadow-md' : 'text-[#8B8FA8] hover:text-white hover:bg-white/5'
                      }`}
                      style={isPathActive && !item.subItems ? { borderLeft: `3px solid ${C}` } : {}}
                    >
                      <Icon size={18} style={isPathActive ? { color: C } : {}} />
                      <span className="flex-1">{item.label}</span>
                      {item.subItems && (
                        <ChevronDown size={16} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      )}
                    </Link>
                    {item.subItems && isExpanded && (
                      <div className="ml-8 mt-1 flex flex-col gap-1 border-l border-white/10 pl-2 mb-2">
                        {item.subItems.map((sub: any) => {
                          const isSubActive = searchParams.get('tab') ? sub.href.includes(`tab=${searchParams.get('tab')}`) : (sub.href.includes('tab=Resellers') && canSeeResellers) || (sub.href.includes('tab=Clients') && !canSeeResellers);
                          return (
                            <Link key={sub.href} href={sub.href} onClick={() => setMobileMenuOpen(false)} className={`text-xs py-2.5 px-3 rounded-lg transition-colors ${isSubActive ? 'text-white bg-white/10 font-black' : 'text-[#8B8FA8] hover:text-white hover:bg-white/5 font-bold'}`}>
                              {sub.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="p-4 border-t border-[var(--border-subtle)]">
              <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-[10px] text-sm font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                <LogOut size={18} /> Cerrar Sesión
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      <main className="serivia-main-content md:mt-0 mt-14 mb-20 md:mb-0">
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
}
