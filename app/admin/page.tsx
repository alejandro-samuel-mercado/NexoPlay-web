'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, Download, Film, Key, TrendingUp, Crown, Settings, Code2, Activity } from 'lucide-react';
import { API, apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="clay-card-dark p-6 rounded-[20px] border-[2px] hover:scale-[1.02] transition-transform"
      style={{ borderColor: color, boxShadow: `4px 4px 0px ${color}` }}>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-[12px] flex items-center justify-center border-[2px] border-[#2C2C2C]"
          style={{ background: color, color: '#2C2C2C', boxShadow: '3px 3px 0px #2C2C2C' }}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-black text-white">{value?.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { isAdmin, isFranchisee, isLoading } = useAuth();
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="clay-skeleton h-28 rounded-[20px]" />)}
      </div>
    </div>
  );

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">Dashboard</h1>
        <p className="text-sm text-[#6B7280] mt-1">Resumen de NexoPlay</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Users size={22} />} label="Usuarios" value={stats?.stats?.totalUsers || 0} color="var(--clay-teal)" />
        <StatCard icon={<Crown size={22} />} label="Suscripciones" value={stats?.stats?.activeSubscriptions || 0} color="var(--clay-yellow)" />
        <StatCard icon={<Film size={22} />} label="Contenido" value={stats?.stats?.totalContent || 0} color="var(--clay-orange)" />
        <StatCard icon={<Download size={22} />} label="Descargas" value={stats?.stats?.totalDownloads || 0} color="var(--clay-mint)" />
      </div>

      {/* Quick Nav */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isAdmin && [
          { href: '/admin/usuarios', icon: <Users size={20} />, label: 'Usuarios', color: 'var(--clay-primary)', desc: 'Gestionar clientes' },
          { href: '/admin/contenido', icon: <Film size={20} />, label: 'Contenido', color: 'var(--clay-yellow)', desc: 'Películas y Series' },
          { href: '/admin/planes', icon: <Crown size={20} />, label: 'Planes de Suscripción', color: 'var(--clay-purple)', desc: 'Crear y editar planes' },
          { href: '/admin/ads', icon: <TrendingUp size={20} />, label: 'Publicidad', color: 'var(--clay-teal)', desc: 'Gestión de anuncios' },
          { href: '/admin/api-keys', icon: <Code2 size={20} />, label: 'API Pública', color: 'var(--clay-orange)', desc: 'Tokens para desarrolladores' },
          { href: '/admin/tenant', icon: <Settings size={20} />, label: 'Marca Blanca', color: 'var(--clay-primary)', desc: 'Personalizar plataforma' },
          { href: '/admin/configuracion', icon: <Settings size={20} />, label: 'Configuración', color: 'var(--clay-mint)', desc: 'Ajustes del sistema' },
        ].map((item) => (
          <Link key={item.href} href={item.href}
            className="clay-card-dark p-6 rounded-2xl border border-[var(--border-subtle)] hover:border-[var(--clay-teal)] transition-colors group flex flex-col items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: `${item.color}20`, color: item.color }}>
              {item.icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[var(--clay-teal)] transition-colors">{item.label}</h3>
              <p className="text-sm text-[var(--text-muted)]">{item.desc}</p>
            </div>
          </Link>
        ))}

        {isFranchisee && !isAdmin && [
          { href: '/admin/tenant/dashboard', icon: <Activity size={20} />, label: 'Mi Dashboard', color: 'var(--clay-mint)', desc: 'Estadísticas de mi tienda' },
          { href: '/admin/tenant', icon: <Settings size={20} />, label: 'Configuración', color: 'var(--clay-primary)', desc: 'Personalizar Marca Blanca' },
        ].map((item) => (
          <Link key={item.href} href={item.href}
            className="clay-card-dark p-6 rounded-2xl border border-[var(--border-subtle)] hover:border-[var(--clay-teal)] transition-colors group flex flex-col items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: `${item.color}20`, color: item.color }}>
              {item.icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[var(--clay-teal)] transition-colors">{item.label}</h3>
              <p className="text-sm text-[var(--text-muted)]">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Codes */}
      {stats?.recentCodes?.length > 0 && (
        <div className="clay-card-dark p-6 rounded-[20px] border-[2px] border-[#3A3A5C]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-white flex items-center gap-2">
              <Key size={18} style={{ color: 'var(--clay-yellow)' }} /> Códigos Recientes
            </h2>
            <Link href="/admin/codigos" className="btn-clay btn-clay-dark btn-clay-sm text-xs">Ver todos</Link>
          </div>
          <div className="space-y-2">
            {stats.recentCodes.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-[10px] bg-white/5">
                <div className="flex items-center gap-3">
                  <span className="font-black text-sm tracking-wider" style={{ fontFamily: 'monospace', color: 'var(--clay-yellow)' }}>
                    {c.code}
                  </span>
                  <span className="text-xs text-[#A8B3C8] truncate max-w-32">{c.contentTitle}</span>
                </div>
                <span className={`clay-badge text-[10px] ${c.isUsed ? 'text-[#6B7280] border-[#3A3A5C]' : 'border-[var(--clay-mint)]'}`}
                  style={{ color: c.isUsed ? undefined : 'var(--clay-mint)' }}>
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
