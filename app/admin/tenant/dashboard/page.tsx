'use client';

import { useAuth } from '@/context/AuthContext';
import { API } from '@/lib/api';
import { Activity, Crown, Globe, Palette, TrendingUp, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function TenantDashboardPage() {
  const { isAdmin, isFranchisee, isLoading: authLoading, user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin && !isFranchisee) router.push('/');
    if (isAdmin || isFranchisee) {
      Promise.all([
        API.TENANT.getDashboard().catch(() => null),
        API.TENANT.getSettings().catch(() => null),
      ]).then(([dash, cfg]) => {
        if (dash?.success) setData(dash.data);
        if (cfg?.success) setSettings(cfg.data);
      }).finally(() => setLoading(false));
    }
  }, [isAdmin, isFranchisee, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="p-8 space-y-4">
        <div className="h-8 w-48 rounded-xl animate-pulse" style={{ background: '#1E1E3A' }} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-[20px] animate-pulse" style={{ background: '#1E1E3A' }} />
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Usuarios Activos', value: data?.activeUsers ?? '—', icon: Users, color: '#60A5FA' },
    { label: 'Suscripciones', value: data?.activeSubscriptions ?? '—', icon: Crown, color: '#A78BFA' },
    { label: 'Ingresos del Mes', value: data?.monthlyRevenue ? `$${data.monthlyRevenue}` : '—', icon: TrendingUp, color: '#34D399' },
    { label: 'Descargas Hoy', value: data?.downloadsToday ?? '—', icon: Activity, color: '#FBBF24' },
  ];

  return (
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-black text-white">Mi Franquicia</h1>
            <span
              className="text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider"
              style={{ background: 'rgba(96,165,250,0.15)', color: '#60A5FA' }}
            >
              FRANQUICIADO
            </span>
          </div>
          <p className="text-sm" style={{ color: '#6B7280' }}>
            {settings?.appName ? `${settings.appName} — ` : ''}Estadísticas de tu tienda
          </p>
        </div>
        {settings?.appName && (
          <div
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl border"
            style={{ background: 'rgba(96,165,250,0.08)', borderColor: 'rgba(96,165,250,0.2)' }}
          >
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="h-7 object-contain" />
            ) : (
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
                style={{ background: settings.primaryColor || '#60A5FA', color: '#0a0a0f' }}
              >
                {settings.appName[0]}
              </div>
            )}
            <div>
              <p className="text-xs font-black text-white">{settings.appName}</p>
              {settings.subdomain && (
                <p className="text-[10px]" style={{ color: '#6B7280' }}>{settings.subdomain}.Vexa.com</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="p-5 rounded-[20px] border hover:scale-[1.02] transition-all duration-300 relative overflow-hidden"
              style={{ background: '#13132A', borderColor: '#1E1E3A', boxShadow: `0 0 20px ${stat.color}10` }}
            >
              <div
                className="absolute top-0 right-0 w-20 h-20 opacity-10 pointer-events-none"
                style={{ background: stat.color, filter: 'blur(25px)', transform: 'translate(40%, -40%)' }}
              />
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${stat.color}20`, color: stat.color }}
              >
                <Icon size={18} />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#6B7280' }}>{stat.label}</p>
              <p className="text-3xl font-black text-white">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-sm font-black uppercase tracking-wider mb-4" style={{ color: '#6B7280' }}>
          Gestión de Mi Tienda
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Customize branding */}
          <div
            className="p-6 rounded-[20px] border"
            style={{ background: '#13132A', borderColor: '#1E1E3A' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(96,165,250,0.15)', color: '#60A5FA' }}>
                <Palette size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">Personalización de Marca</h3>
                <p className="text-xs" style={{ color: '#6B7280' }}>Logo, nombre y colores de tu tienda</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <span className="text-xs font-bold text-white">Nombre</span>
                <span className="text-xs" style={{ color: '#6B7280' }}>{settings?.appName || 'Sin configurar'}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <span className="text-xs font-bold text-white">Color Primario</span>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md border border-white/10" style={{ background: settings?.primaryColor || '#60A5FA' }} />
                  <span className="text-xs font-mono" style={{ color: '#6B7280' }}>{settings?.primaryColor || 'No definido'}</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <span className="text-xs font-bold text-white">Subdominio</span>
                <span className="text-xs" style={{ color: '#6B7280' }}>
                  {settings?.subdomain ? `${settings.subdomain}.Vexa.com` : 'Sin configurar'}
                </span>
              </div>
            </div>

            <a
              href="/admin/tenant"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-black transition-all hover:brightness-110"
              style={{ background: '#60A5FA', color: '#0a0a0f' }}
            >
              <Palette size={15} /> Editar configuración
            </a>
          </div>

          {/* Domain + access */}
          <div
            className="p-6 rounded-[20px] border"
            style={{ background: '#13132A', borderColor: '#1E1E3A' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(52,211,153,0.15)', color: '#34D399' }}>
                <Globe size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">Acceso a tu Plataforma</h3>
                <p className="text-xs" style={{ color: '#6B7280' }}>URLs y acceso para tus clientes</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#6B7280' }}>URL Web de tu Tienda</p>
                <p className="text-xs font-mono text-white">
                  {settings?.subdomain ? `${settings.subdomain}.Vexa.com` : 'Configurar subdominio →'}
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#6B7280' }}>Contenido</p>
                <p className="text-xs text-white">Mismo catálogo global de Vexa</p>
                <p className="text-[10px] mt-0.5" style={{ color: '#6B7280' }}>Administrado por el Admin Global</p>
              </div>
            </div>

            <div
              className="p-3 rounded-xl border text-center"
              style={{ background: 'rgba(52,211,153,0.05)', borderColor: 'rgba(52,211,153,0.2)' }}
            >
              <p className="text-xs" style={{ color: '#34D399' }}>
                💡 Para cambios en el contenido o plan, contactá al Admin Global
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent activity placeholder */}
      <div
        className="p-6 rounded-[20px] border"
        style={{ background: '#13132A', borderColor: '#1E1E3A' }}
      >
        <h2 className="font-black text-white flex items-center gap-2 mb-4">
          <Activity size={18} style={{ color: '#60A5FA' }} /> Actividad Reciente
        </h2>
        <div className="text-center py-8">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-sm font-bold text-white">Pronto disponible</p>
          <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
            El historial de actividad de tu franquicia aparecerá aquí
          </p>
        </div>
      </div>
    </div>
  );
}
