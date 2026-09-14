'use client';
import "./admin.css";

import { useAuth } from '@/context/AuthContext';
import {
    ArrowLeft,
    BarChart3,
    Bell,
    Building2,
    Code2,
    Coins,
    Crown,
    Film, Key,
    LayoutDashboard,
    MessageCircleHeart,
    Monitor,
    Settings,
    ShieldCheck,
    Store,
    TrendingUp,
    Users,
    ChevronDown,
    LogOut,
    Menu,
    X
} from 'lucide-react';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// All nav items for ADMIN
const ADMIN_NAV_ITEMS = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { 
    href: '/admin/usuarios', 
    icon: Users, 
    label: 'Usuarios',
    subItems: [
      { href: '/admin/usuarios?tab=Admins', label: 'Administradores' },
      { href: '/admin/usuarios?tab=Resellers', label: 'Revendedores' },
      { href: '/admin/usuarios?tab=Clients', label: 'Clientes Finales' },
    ]
  },
  { href: '/admin/contenido', icon: Film, label: 'Contenido' },
  { href: '/admin/hero', icon: Monitor, label: 'Contenido de portadas', mobileHidden: true },
  { href: '/admin/planes', icon: Crown, label: 'Planes' },

  { href: '/admin/tokens', icon: Coins, label: 'Créditos' },
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
  const searchParams = useSearchParams();
  const { user, isAdmin, isFranchisee, isLoading, logout } = useAuth();
  const router = useRouter();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAdmin && !isFranchisee) {
      router.push('/auth/login');
    }
  }, [isLoading, isAdmin, isFranchisee, router]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[100] bg-[var(--bg-main)] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!isAdmin && !isFranchisee) {
    return null;
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
             
              <span className="text-white">Vexa</span>
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
          {(navItems as any[]).map((item) => {
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
                  style={isPathActive && !item.subItems ? { background: roleColor } : {}}
                >
                  <Icon size={17} />
                  <span className="flex-1">{item.label}</span>
                  {item.subItems && (
                    <ChevronDown size={14} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  )}
                </Link>
                
                {item.subItems && isExpanded && (
                  <div className="ml-8 mt-1 flex flex-col gap-1 border-l border-white/10 pl-2">
                    {item.subItems.map((sub: any) => {
                      const isSubActive = searchParams.get('tab') ? sub.href.includes(`tab=${searchParams.get('tab')}`) : sub.href.includes('tab=Admins');
                      return (
                        <Link 
                          key={sub.href} 
                          href={sub.href} 
                          className={`text-xs py-2 px-3 rounded-lg transition-colors ${isSubActive ? 'text-white bg-white/10 font-black' : 'text-[#8B8FA8] hover:text-white hover:bg-white/5 font-bold'}`}
                        >
                          {sub.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User info + back link */}
        <div className="p-3 border-t border-[var(--border-subtle)] space-y-2">
          <div className="px-3 py-2.5 rounded-[10px] flex items-center gap-2.5" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div
              className="w-8 h-8 rounded-full 
              flex-shrink-0 overflow-hidden border-2"
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

          <button 
            onClick={logout} 
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-[10px] text-xs font-bold text-white/50 hover:text-white hover:bg-white/5 transition-colors border border-transparent hover:border-white/10 mt-2"
          >
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 border-b border-[var(--border-subtle)] px-4 py-3 flex items-center justify-between bg-[var(--bg-panel)] backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[8px] flex items-center justify-center text-xs font-black text-white" style={{ background: roleColor }}>N</div>
          <span className="font-black text-white text-sm" style={{ fontFamily: 'Space Grotesk' }}>Vexa</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md" style={{ background: roleBg, color: roleColor }}>{roleBadge}</span>
          <div className="w-8 h-8 rounded-full border border-white/20 overflow-hidden">
             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.email || 'admin')}`} alt="Avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navbar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border-subtle)] bg-[var(--bg-panel)] backdrop-blur-xl pb-safe flex justify-around items-center px-2 py-2">
        {navItems.slice(0, 4).map((item: any) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)} className={`flex flex-col items-center p-2 rounded-xl transition-all ${isActive ? 'text-white' : 'text-[#8B8FA8] hover:text-white'}`}>
              <Icon size={20} style={isActive ? { color: roleColor } : {}} />
              <span className="text-[10px] mt-1 font-bold" style={isActive ? { color: roleColor } : {}}>{item.label.length > 10 ? item.label.substring(0,10)+'...' : item.label}</span>
            </Link>
          );
        })}
        <button onClick={() => setMobileMenuOpen(true)} className={`flex flex-col items-center p-2 rounded-xl transition-all ${mobileMenuOpen ? 'text-white' : 'text-[#8B8FA8] hover:text-white'}`}>
          <Menu size={20} style={mobileMenuOpen ? { color: roleColor } : {}} />
          <span className="text-[10px] mt-1 font-bold" style={mobileMenuOpen ? { color: roleColor } : {}}>Menú</span>
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
              {(navItems as any[]).map((item) => {
                const isPathActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
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
                      style={isPathActive && !item.subItems ? { borderLeft: `3px solid ${roleColor}` } : {}}
                    >
                      <Icon size={18} style={isPathActive ? { color: roleColor } : {}} />
                      <span className="flex-1">{item.label}</span>
                      {item.subItems && (
                        <ChevronDown size={16} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      )}
                    </Link>
                    {item.subItems && isExpanded && (
                      <div className="ml-8 mt-1 flex flex-col gap-1 border-l border-white/10 pl-2 mb-2">
                        {item.subItems.map((sub: any) => {
                          const isSubActive = searchParams.get('tab') ? sub.href.includes(`tab=${searchParams.get('tab')}`) : sub.href.includes('tab=Admins');
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
              <button onClick={logout} className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-[10px] text-sm font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                <LogOut size={18} /> Cerrar Sesión
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <main className="serivia-main-content md:mt-0 mt-14 mb-20 md:mb-0">
        <div className="w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
