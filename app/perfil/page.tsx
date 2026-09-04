'use client';

import PublicLayout from '@/components/layout/PublicLayout';
import { useAuth } from '@/context/AuthContext';
import { Calendar, Clock, Crown, LogOut, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PerfilPage() {
  const { user, isLoggedIn, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/auth/login');
    }
  }, [isLoading, isLoggedIn]);

  if (isLoading || !user) return (
    <PublicLayout>
      <div className="pt-8 w-full max-w-4xl mx-auto">
        <div className="shimmer h-48 rounded-[24px]" />
      </div>
    </PublicLayout>
  );

  const getRoleLabel = () => {
    switch (user.role) {
      case 'ADMIN': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#121215] text-[#FFD700] border border-[#FFD700]/20"><Shield size={12} className="inline mr-1" /> Administrador</span>;
      case 'SUBSCRIBER': return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#121215] text-[#FFD700] border border-[#FFD700]/20"><Crown size={12} className="inline mr-1" /> Suscriptor</span>;
      default: return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#121215] text-white border border-white/10">Invitado</span>;
    }
  };

  return (
    <PublicLayout>
      <div className="pt-8 w-full max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[var(--text-main)] mb-8 tracking-tight">Mi Perfil</h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* User Info Card */}
          <div className="md:col-span-1">
            <div className="bg-[var(--bg-panel)] p-8 rounded-3xl border border-[var(--border-subtle)] text-center shadow-xl">
              <div className="w-24 h-24 mx-auto rounded-full mb-4 flex items-center justify-center text-4xl font-bold border-4 border-[var(--bg-hover)] bg-[var(--bg-main)] text-[var(--text-main)]">
                {user.username?.[0]?.toUpperCase() || user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
              </div>
              <h2 className="text-xl font-bold text-[var(--text-main)] mb-1 truncate">{user.name || 'Usuario Nexo'}</h2>
              <p className="text-sm text-[var(--text-muted)] mb-6 truncate">{user.username || (user.email?.endsWith('@Vexa.com') ? user.email.split('@')[0] : user.email)}</p>
              <div className="mb-8">{getRoleLabel()}</div>
              
              <button onClick={() => logout()} className="w-full bg-[var(--bg-hover)] hover:bg-[var(--bg-hover-strong)] transition-colors text-[var(--text-main)] font-semibold rounded-full py-3 flex items-center justify-center gap-2">
                <LogOut size={16} /> Cerrar Sesión
              </button>
            </div>
          </div>

          {/* Subscription Info */}
          <div className="md:col-span-2">
            {(user as any).subscription ? (
              <div className="bg-[var(--bg-panel)] p-8 rounded-3xl border border-[var(--border-subtle)] shadow-xl relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>

                <div className="flex items-center gap-4 mb-8 relative z-10">
                  <div className="w-12 h-12 bg-[var(--border-strong)] rounded-full flex items-center justify-center border border-[var(--border-focus)]">
                    <Crown size={24} className="text-[#FFD700]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[var(--text-main)]">Mi Plan: <span className="text-[#FFD700]">{(user as any).subscription.plan.name}</span></h3>
                    <p className="text-[var(--text-muted)] text-sm">Estado: <span className="text-green-500 font-semibold">{(user as any).subscription.status}</span></p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 mb-8 relative z-10">
                  <div className="bg-[var(--bg-main)] p-5 rounded-2xl border border-[var(--border-subtle)]">
                    <p className="text-xs text-[var(--text-muted)] uppercase font-bold tracking-wider mb-2 flex items-center gap-2">
                      <Clock size={14} /> Fecha de inicio
                    </p>
                    <p className="font-semibold text-[var(--text-main)]">{new Date((user as any).subscription.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-[var(--bg-main)] p-5 rounded-2xl border border-[var(--border-subtle)]">
                    <p className="text-xs text-[var(--text-muted)] uppercase font-bold tracking-wider mb-2 flex items-center gap-2">
                      <Calendar size={14} /> Vencimiento
                    </p>
                    <p className="font-semibold text-[var(--text-main)]">{new Date((user as any).subscription.expiresAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="bg-[var(--bg-main)] rounded-2xl p-6 border border-[var(--border-subtle)] relative z-10">
                  <h4 className="font-bold text-[var(--text-main)] mb-4">Consumo de Créditos (Descargas)</h4>
                  
                  {/* Límite Diario */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[var(--text-muted)]">Gastados hoy</span>
                      <span className="text-[var(--text-main)] font-bold">{(user as any).stats?.todayDownloads || 0} / {(user as any).subscription.plan.dailyLimit}</span>
                    </div>
                    <div className="w-full bg-[var(--bg-hover)] h-2.5 rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--btn-primary-bg)] rounded-full transition-all duration-1000" 
                           style={{ width: `${Math.min((((user as any).stats?.todayDownloads || 0) / (user as any).subscription.plan.dailyLimit) * 100, 100)}%` }} />
                    </div>
                  </div>

                  {/* Límite Total */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[var(--text-muted)]">Total gastados (Mes actual)</span>
                      <span className="text-[var(--text-main)] font-bold">{(user as any).stats?.totalDownloads || 0} / {(user as any).subscription.plan.credits}</span>
                    </div>
                    <div className="w-full bg-[var(--bg-hover)] h-2.5 rounded-full overflow-hidden">
                      <div className="h-full bg-[#FFD700] rounded-full transition-all duration-1000" 
                           style={{ width: `${Math.min((((user as any).stats?.totalDownloads || 0) / (user as any).subscription.plan.credits) * 100, 100)}%` }} />
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-[var(--bg-panel)] p-10 rounded-3xl border border-[var(--border-subtle)] text-center flex flex-col items-center justify-center h-full shadow-xl">
                <div className="text-5xl mb-4 opacity-50">💔</div>
                <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">Sin suscripción activa</h3>
                <p className="text-[var(--text-muted)] mb-8">No tenés ningún plan de Vexa activo. Actualizá tu cuenta para ver contenido premium.</p>
                {/* Tienda Link - REMOVED BY USER REQUEST
                <button onClick={() => router.push('/tienda')} className="btn-primary">
                  Ver Planes Disponibles
                </button>
                */}
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
