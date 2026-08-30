'use client';

import SyncButton from '@/components/admin/SyncButton';
import { useAuth } from '@/context/AuthContext';
import { API, apiFetch } from '@/lib/api';
import {
    ArrowUpRight,
    BarChart3,
    Bell,
    Building2,
    Code2,
    Coins,
    Crown,
    Download, Film, Key,
    Settings,
    Store,
    TrendingUp,
    Users
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function StatCard({
  icon, label, value, color, trend
}: {
  icon: React.ReactNode; label: string; value: string | number; color: string; trend?: string;
}) {
  return (
    <div
      className="p-5 rounded-[20px] border border-white/5 hover:bg-white/[0.02] transition-all duration-300 cursor-default relative overflow-hidden"
      style={{ background: 'var(--bg-panel)' }}
    >
      {/* Glow effect */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)`, filter: 'blur(20px)', transform: 'translate(40%, -40%)' }}
      />
      <div className="flex items-start justify-between relative z-10">
        <div
          className="w-11 h-11 rounded-[12px] flex items-center justify-center mb-3 shadow-lg"
          style={{ background: `linear-gradient(135deg, ${color}20, ${color}10)`, color, border: `1px solid ${color}30` }}
        >
          {icon}
        </div>
        {trend && (
          <span className="text-[10px] font-bold px-2 py-1 rounded-lg" style={{ background: `${color}20`, color }}>
            {trend}
          </span>
        )}
      </div>
      <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#6B7280' }}>{label}</p>
      <p className="text-3xl font-black text-white">{typeof value === 'number' ? value.toLocaleString() : value}</p>
    </div>
  );
}

function QuickLink({ href, icon, label, color, desc }: {
  href: string; icon: React.ReactNode; label: string; color: string; desc: string;
}) {
  return (
    <Link
      href={href}
      className="group p-5 rounded-[16px] border border-white/5 hover:border-white/10 hover:bg-white/[0.02] transition-all duration-300 flex flex-col items-start gap-4 relative overflow-hidden"
      style={{ background: 'var(--bg-panel)' }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle at top right, ${color}10, transparent 70%)` }}
      />
      <div className="flex items-center justify-between w-full relative z-10">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 duration-300 shadow-sm"
          style={{ backgroundColor: `${color}15`, color, border: `1px solid ${color}20` }}
        >
          {icon}
        </div>
        <ArrowUpRight
          size={16}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ color }}
        />
      </div>
      <div>
        <h3 className="text-sm font-black text-white mb-0.5 group-hover:text-opacity-90 transition-colors">
          {label}
        </h3>
        <p className="text-xs" style={{ color: '#6B7280' }}>{desc}</p>
      </div>
    </Link>
  );
}

export default function AdminDashboard() {
  const { isAdmin, isFranchisee, isLoading, user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAdmin && !isFranchisee) {
      router.push('/');
      return;
    }
    if (isAdmin || isFranchisee) {
      apiFetch(API.ADMIN.DASHBOARD).then(res => {
        if (res.success) setStats(res.data);
      }).catch(console.error).finally(() => setLoading(false));
    }
  }, [isAdmin, isFranchisee, isLoading]);

  if (isLoading || loading) return (
    <div className="p-8">
      <div className="mb-2 h-8 w-48 rounded-xl animate-pulse" style={{ background: '#1E1E3A' }} />
      <div className="mb-8 h-4 w-32 rounded-lg animate-pulse" style={{ background: '#1A1A2E' }} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-[20px] animate-pulse" style={{ background: '#1E1E3A' }} />
        ))}
      </div>
    </div>
  );

  // Franchisee-only view
  if (isFranchisee && !isAdmin) {
    return (
      <div className="p-6 sm:p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-white">Mi Franquicia</h1>
            <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
              Bienvenido, {user?.name}. Aquí gestionás tu tienda.
            </p>
          </div>
          <SyncButton />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={<Users size={20} />} label="Usuarios" value={stats?.stats?.totalUsers || 0} color="#60A5FA" />
          <StatCard icon={<Crown size={20} />} label="Suscripciones" value={stats?.stats?.activeSubscriptions || 0} color="#A78BFA" />
          <StatCard icon={<Film size={20} />} label="Contenido" value={stats?.stats?.totalContent || 0} color="#34D399" />
          <StatCard icon={<Download size={20} />} label="Descargas" value={stats?.stats?.totalDownloads || 0} color="#FBBF24" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuickLink href="/admin/tenant" icon={<Store size={18} />} label="Mi Tienda" color="#60A5FA" desc="Personalizar logo, nombre y colores" />
          <QuickLink href="/admin/tenant/dashboard" icon={<BarChart3 size={18} />} label="Estadísticas" color="#34D399" desc="Ingresos y usuarios de tu franquicia" />
        </div>
      </div>
    );
  }

  // Full admin view
  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-black text-white">Dashboard</h1>
            <span
              className="text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider"
              style={{ background: 'rgba(220,38,38,0.15)', color: '#FF5C5C' }}
            >
              Admin Global
            </span>
          </div>
          <p className="text-sm" style={{ color: '#6B7280' }}>
            Resumen completo de Vexa
          </p>
        </div>
        <SyncButton />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Users size={20} />} label="Usuarios Totales" value={stats?.stats?.totalUsers || 0} color="#00D2B4" trend="+12%" />
        <StatCard icon={<Crown size={20} />} label="Suscripciones Activas" value={stats?.stats?.activeSubscriptions || 0} color="#FFD23F" trend="+5%" />
        <StatCard icon={<Film size={20} />} label="Contenido" value={stats?.stats?.totalContent || 0} color="#FF8C32" />
        <StatCard icon={<Download size={20} />} label="Descargas Totales" value={stats?.stats?.totalDownloads || 0} color="#A855F7" />
      </div>

      {/* Quick Nav Grid */}
      <div className="mb-6">
        <h2 className="text-sm font-black uppercase tracking-wider mb-4" style={{ color: '#6B7280' }}>
          Módulos del Sistema
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <QuickLink href="/admin/usuarios" icon={<Users size={18} />} label="Usuarios" color="#00D2B4" desc="Gestionar cuentas y roles" />
          <QuickLink href="/admin/contenido" icon={<Film size={18} />} label="Contenido" color="#FFD23F" desc="Películas, series y anime" />
          <QuickLink href="/admin/planes" icon={<Crown size={18} />} label="Planes" color="#A855F7" desc="Crear y editar suscripciones" />
          <QuickLink href="/admin/tokens" icon={<Coins size={18} />} label="Tokens" color="#FBBF24" desc="Moneda interna y paquetes" />
          <QuickLink href="/admin/codigos" icon={<Key size={18} />} label="Códigos" color="#F97316" desc="Códigos de acceso y regalo" />
          <QuickLink href="/admin/ads" icon={<TrendingUp size={18} />} label="Publicidad" color="#34D399" desc="Campañas para usuarios gratis" />
          <QuickLink href="/admin/tenant" icon={<Building2 size={18} />} label="Franquicias" color="#60A5FA" desc="Gestionar tiendas y marcas blancas" />
          <QuickLink href="/admin/api-keys" icon={<Code2 size={18} />} label="API Pública" color="#EC4899" desc="Keys para desarrolladores" />
          <QuickLink href="/admin/notificaciones" icon={<Bell size={18} />} label="Notificaciones" color="#F59E0B" desc="Avisos push masivos" />
          <QuickLink href="/admin/configuracion" icon={<Settings size={18} />} label="Configuración" color="#8B8FA8" desc="Ajustes del sistema" />
        </div>
      </div>

      {/* Recent Codes */}
      {stats?.recentCodes?.length > 0 && (
        <div
          className="p-6 rounded-[20px] border border-white/5 shadow-xl"
          style={{ background: 'var(--bg-panel)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-white flex items-center gap-2">
              <Key size={18} style={{ color: '#FFD23F' }} /> Códigos Recientes
            </h2>
            <Link
              href="/admin/codigos"
              className="text-xs font-bold px-3 py-1.5 rounded-lg border transition-all hover:opacity-80 flex items-center gap-1"
              style={{ borderColor: '#2E2E4A', color: '#8B8FA8' }}
            >
              Ver todos <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="space-y-2">
            {stats.recentCodes.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-[10px]" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <div className="flex items-center gap-3">
                  <span className="font-black text-sm tracking-wider" style={{ fontFamily: 'monospace', color: '#FFD23F' }}>
                    {c.code}
                  </span>
                  <span className="text-xs truncate max-w-32" style={{ color: '#8B8FA8' }}>{c.contentTitle}</span>
                </div>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                  style={{
                    background: c.isUsed ? 'rgba(107,114,128,0.15)' : 'rgba(52,211,153,0.15)',
                    color: c.isUsed ? '#6B7280' : '#34D399',
                  }}
                >
                  {c.isUsed ? 'Usado' : 'Disponible'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
