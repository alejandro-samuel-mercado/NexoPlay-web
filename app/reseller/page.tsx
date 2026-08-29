'use client';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Coins, Download, Package, TrendingUp, Users, Zap } from 'lucide-react';
import { apiFetch, API } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const C = '#34D399';

function StatCard({ icon: Icon, label, value, color, sub, href }: any) {
  const inner = (
    <div className="p-5 rounded-[20px] border border-white/5 hover:bg-white/[0.02] transition-all duration-300 relative overflow-hidden group" style={{ background: 'var(--bg-panel)' }}>
      <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20 pointer-events-none"
        style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)`, filter: 'blur(20px)', transform: 'translate(40%,-40%)' }} />
      <div className="flex items-start justify-between relative z-10">
        <div className="w-11 h-11 rounded-[12px] flex items-center justify-center mb-3 shadow-lg"
          style={{ background: `${color}20`, color, border: `1px solid ${color}30` }}>
          <Icon size={20} />
        </div>
        {href && <ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color }} />}
      </div>
      <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#6B7280' }}>{label}</p>
      <p className="text-3xl font-black text-white">{typeof value === 'number' ? value.toLocaleString() : (value ?? '—')}</p>
      {sub && <p className="text-xs mt-1" style={{ color: '#6B7280' }}>{sub}</p>}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default function ResellerDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [pack, setPack] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/reseller/stats`).catch(() => null),
      apiFetch(API.TOKENS.WALLET).catch(() => null),
      apiFetch(API.TOKENS.WEEKLY_PACK).catch(() => null),
    ]).then(([s, w, p]) => {
      if (s?.data) setStats(s.data);
      if (w?.data) setWallet(w.data);
      if (p?.data) setPack(p.data);
      setLoading(false);
    });
  }, []);

  const plan = user?.subscription?.plan;
  const pct = stats ? Math.min(100, (stats.dailyUsed / (stats.dailyLimit || 1)) * 100) : 0;

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <Download size={28} style={{ color: C }} /> Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
          Bienvenido, {user?.name || user?.username}
          {plan && <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-md" style={{ background: 'rgba(52,211,153,0.1)', color: C }}>Plan: {plan.name}</span>}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Download} label="Descargas Hoy" color={C} href="/reseller/descargas"
          value={loading ? '…' : stats?.dailyUsed ?? 0}
          sub={loading ? '' : `${stats?.dailyRemaining ?? 0} restantes de ${stats?.dailyLimit ?? 0}`} />
        <StatCard icon={Coins} label="Tokens" color="#EAB308" href="/reseller/tokens"
          value={loading ? '…' : wallet?.balance ?? 0} sub="1 token = 1 descarga extra" />
        <StatCard icon={TrendingUp} label="Total Histórico" color="#A78BFA"
          value={loading ? '…' : stats?.totalAllTime ?? 0} sub="descargas realizadas" />
        <StatCard icon={Package} label="Pack Semanal" color="#F59E0B" href="/reseller/pack"
          value={loading ? '…' : (pack ? pack.contents?.length ?? pack.contentIds?.length ?? 0 : 0)}
          sub={pack ? `"${pack.title}"` : 'No disponible'} />
      </div>

      {/* Daily progress bar */}
      {stats && (
        <div className="rounded-[20px] border border-white/5 p-6 mb-8" style={{ background: 'var(--bg-panel)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="font-black text-white flex items-center gap-2"><Download size={16} style={{ color: C }} /> Límite diario de descargas</span>
            <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background: stats.dailyRemaining === 0 ? 'rgba(255,80,80,0.2)' : 'rgba(52,211,153,0.15)', color: stats.dailyRemaining === 0 ? '#FF5050' : C }}>
              {stats.dailyRemaining} restantes
            </span>
          </div>
          <div className="flex items-end gap-3 mb-3">
            <span className="text-5xl font-black text-white">{stats.dailyUsed}</span>
            <span className="text-xl font-bold mb-1" style={{ color: '#6B7280' }}>/ {stats.dailyLimit}</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: pct >= 90 ? '#EF4444' : C }} />
          </div>
          <div className="flex items-center justify-between mt-3">
            <p className="text-xs" style={{ color: '#6B7280' }}>Se reinicia a las 00:00 UTC</p>
            <Link href="/reseller/tokens" className="text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all hover:opacity-80"
              style={{ background: 'rgba(234,179,8,0.1)', color: '#EAB308', border: '1px solid rgba(234,179,8,0.3)' }}>
              <Zap size={11} /> Comprar créditos extra
            </Link>
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { href: '/reseller/usuarios', icon: Users, label: 'Mis Clientes', desc: 'Crear y gestionar cuentas de suscriptores', color: '#60A5FA' },
          { href: '/reseller/descargas', icon: Download, label: 'Catálogo', desc: 'Buscar y descargar contenido en 4K/1080p', color: C },
          { href: '/reseller/pack', icon: Package, label: 'Pack Semanal', desc: pack ? `${pack.contents?.length ?? 0} títulos disponibles` : 'Sin pack activo', color: '#F59E0B' },
          { href: '/reseller/tokens', icon: Coins, label: 'Mis Tokens', desc: `Saldo: ${wallet?.balance ?? 0} tokens`, color: '#EAB308' },
        ].map(({ href, icon: Icon, label, desc, color }) => (
          <Link key={href} href={href}
            className="group p-5 rounded-[16px] border border-white/5 hover:border-white/10 hover:bg-white/[0.02] transition-all duration-300 flex flex-col items-start gap-4 relative overflow-hidden"
            style={{ background: 'var(--bg-panel)' }}>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
              style={{ background: `radial-gradient(circle at top right, ${color}10, transparent 70%)` }} />
            <div className="flex items-center justify-between w-full relative z-10">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 duration-300 shadow-sm"
                style={{ backgroundColor: `${color}15`, color, border: `1px solid ${color}20` }}>
                <Icon size={20} />
              </div>
              <ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ color }} />
            </div>
            <div className="relative z-10">
              <p className="font-black text-white text-sm mb-1">{label}</p>
              <p className="text-xs" style={{ color: '#6B7280' }}>{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
