'use client';

import { useState, useEffect, useCallback } from 'react';
import { Download, Coins, Package, Search, Filter, Clock, ChevronDown, Star, Zap } from 'lucide-react';
import { API, apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import SyncButton from '@/components/admin/SyncButton';

interface ContentItem {
  id: string;
  slug: string;
  type: string;
  releaseYear: number | null;
  title: string | null;
  rating: number | null;
  posterUrl: string | null;
  isDownloadable: boolean;
  hasVideo: boolean;
}

interface WalletInfo {
  balance: number;
  recentTransactions: any[];
}

interface WeeklyPack {
  id: string;
  title: string;
  contents: ContentItem[];
}

const VPS_BASE_MOVIES = process.env.NEXT_PUBLIC_VPS_MOVIES_URL || '';
const VPS_BASE_SERIES = process.env.NEXT_PUBLIC_VPS_SERIES_URL || '';

export default function ResellerDashboard() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [catalog, setCatalog] = useState<ContentItem[]>([]);
  const [weeklyPack, setWeeklyPack] = useState<WeeklyPack | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [todayCount, setTodayCount] = useState(0);
  const [totalDownloads, setTotalDownloads] = useState(0);
  const [downloadsThisPlan, setDownloadsThisPlan] = useState(0);
  const [planUnlimited, setPlanUnlimited] = useState(false);
  const DAILY_LIMIT = user?.subscription?.plan?.dailyDownloadLimit ?? 30;

  const loadData = useCallback(async () => {
    try {
      const [walletRes, contentRes, packRes, meRes] = await Promise.all([
        apiFetch(API.TOKENS.WALLET).catch(() => null),
        apiFetch(`${API.CONTENT.BASE}?limit=200&lang=es`).catch(() => ({ data: [] })),
        apiFetch(API.TOKENS.WEEKLY_PACK).catch(() => null),
        apiFetch(API.AUTH.ME).catch(() => null),
      ]);

      if (walletRes?.data) setWallet(walletRes.data);
      if (contentRes?.data) setCatalog(contentRes.data);
      if (packRes?.data) setWeeklyPack(packRes.data);
      if (meRes?.data) {
        const stats = meRes.data.downloadStats;
        setTodayCount(stats?.creditsUsedToday ?? 0);
        setTotalDownloads(stats?.totalDownloads ?? 0);
        setDownloadsThisPlan(stats?.downloadsThisPlan ?? 0);
        setPlanUnlimited(stats?.planUnlimited ?? false);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDownload = async (contentId: string, contentTitle: string, quality: string = '1080p') => {
    setDownloadingId(contentId);
    try {
      const res = await apiFetch(API.DOWNLOADS.DOWNLOAD(contentId), {
        method: 'POST',
        body: JSON.stringify({ quality }),
      });
      if (res?.data?.downloadUrl) {
        window.open(res.data.downloadUrl, '_blank');
        setTodayCount(c => c + 1);
      }
    } catch (err: any) {
      alert(err.message || 'Error al descargar');
    } finally {
      setDownloadingId(null);
    }
  };

  const filtered = catalog.filter(item => {
    const matchSearch = !search || (item.title || '').toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'ALL' || item.type === typeFilter;
    return matchSearch && matchType && item.hasVideo;
  });

  const DAILY_EFFECTIVE = user?.downloadStats?.effectiveLimit ?? DAILY_LIMIT;
  const remaining = Math.max(0, DAILY_EFFECTIVE - todayCount);
  const pct = Math.min(100, (todayCount / DAILY_EFFECTIVE) * 100);

  const handleBuyLimitsAPI = async () => {
    if (!confirm('¿Seguro que quieres comprar 10 descargas extra por 100 tokens?')) return;
    try {
      const res = await API.RESELLER.buyLimits(10);
      if (res.success) {
        alert('Límites comprados exitosamente');
        loadData();
      }
    } catch (e: any) {
      alert(e.message || 'Error al comprar límites');
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-main)' }}>
      {/* Header */}
      <div className="border-b" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'var(--bg-panel)' }}>
        <div className="w-full px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black"
              style={{ background: 'var(--clay-teal)', color: 'var(--clay-ink)', boxShadow: '2px 2px 0 var(--clay-ink)', border: '2px solid var(--clay-ink)' }}>
              R
            </div>
            <div>
              <p className="font-black text-white text-sm">Panel Revendedor</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Token balance */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl border-2" style={{ borderColor: 'var(--clay-yellow)', background: 'rgba(255,210,63,0.1)' }}>
              <Coins size={16} style={{ color: 'var(--clay-yellow)' }} />
              <span className="font-black text-white text-sm">{wallet?.balance ?? '—'}</span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>tokens</span>
            </div>
            <SyncButton />
            <Link href="/" className="text-xs font-bold px-3 py-2 rounded-xl border-2 transition-colors"
              style={{ borderColor: 'rgba(255,255,255,0.12)', color: 'var(--text-muted)' }}>
              ← Catálogo
            </Link>
          </div>
        </div>
      </div>

      <div className="w-full px-4 py-6 space-y-6">

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Daily counter */}
          <div className="col-span-2 rounded-2xl p-5 border border-white/5 shadow-xl relative overflow-hidden" style={{ background: 'var(--bg-panel)' }}>
            <div
              className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 pointer-events-none"
              style={{ background: 'radial-gradient(circle, var(--clay-teal) 0%, transparent 70%)', filter: 'blur(20px)', transform: 'translate(30%, -30%)' }}
            />
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className="flex items-center gap-2">
                <Download size={18} style={{ color: 'var(--clay-teal)' }} />
                <span className="font-black text-white text-sm">Descargas Hoy</span>
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background: remaining === 0 ? 'rgba(255,80,80,0.2)' : 'rgba(0,210,180,0.2)', color: remaining === 0 ? '#ff5050' : 'var(--clay-teal)' }}>
                {remaining} restantes
              </span>
            </div>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-4xl font-black text-white">{todayCount}</span>
              <span className="text-lg font-bold mb-1" style={{ color: 'var(--text-muted)' }}>/ {DAILY_EFFECTIVE}</span>
            </div>
            {/* Progress bar */}
            <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: pct >= 90 ? '#ff5050' : 'var(--clay-teal)' }} />
            </div>
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Se reinicia a las 00:00.</p>
              <button onClick={handleBuyLimitsAPI} className="text-xs font-bold px-3 py-1 rounded border-2 hover:opacity-80"
                style={{ borderColor: 'var(--clay-yellow)', color: 'var(--clay-yellow)', background: 'rgba(255,210,63,0.1)' }}>
                +10 (100 Tokens)
              </button>
            </div>
          </div>

          {/* Token balance card */}
          <div className="rounded-2xl p-5 border border-white/5 shadow-xl relative overflow-hidden" style={{ background: 'var(--bg-panel)' }}>
            <div
              className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 pointer-events-none"
              style={{ background: 'radial-gradient(circle, var(--clay-yellow) 0%, transparent 70%)', filter: 'blur(20px)', transform: 'translate(30%, -30%)' }}
            />
            <div className="flex items-center gap-2 mb-2 relative z-10">
              <Coins size={18} style={{ color: 'var(--clay-yellow)' }} />
              <span className="font-black text-white text-sm">Tokens</span>
            </div>
            <p className="text-4xl font-black text-white">{wallet?.balance ?? '—'}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>1 token = 1 descarga extra</p>
          </div>

          {/* Plan-period usage card */}
          <div className="rounded-2xl p-5 border border-white/5 shadow-xl relative overflow-hidden" style={{ background: 'var(--bg-panel)' }}>
            <div
              className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 pointer-events-none"
              style={{ background: 'radial-gradient(circle, var(--clay-orange) 0%, transparent 70%)', filter: 'blur(20px)', transform: 'translate(30%, -30%)' }}
            />
            <div className="flex items-center gap-2 mb-2 relative z-10">
              <Clock size={18} style={{ color: 'var(--clay-orange)' }} />
              <span className="font-black text-white text-sm">Este Plan</span>
            </div>
            <p className="text-4xl font-black text-white">{downloadsThisPlan}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              {planUnlimited ? 'sin límite' : `de ${DAILY_LIMIT}/día`} · desde inicio
            </p>
          </div>

          {/* All-time total card */}
          <div className="rounded-2xl p-5 border border-white/5 shadow-xl relative overflow-hidden" style={{ background: 'var(--bg-panel)' }}>
            <div
              className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10 pointer-events-none"
              style={{ background: 'radial-gradient(circle, var(--clay-purple) 0%, transparent 70%)', filter: 'blur(20px)', transform: 'translate(30%, -30%)' }}
            />
            <div className="flex items-center gap-2 mb-2 relative z-10">
              <Package size={18} style={{ color: 'var(--clay-purple)' }} />
              <span className="font-black text-white text-sm">Total Histórico</span>
            </div>
            <p className="text-4xl font-black text-white">{totalDownloads}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>descargas realizadas</p>
          </div>
        </div>

        {/* Weekly Pack */}
        {weeklyPack && weeklyPack.contents?.length > 0 && (
          <div className="rounded-2xl p-5 border border-white/5 shadow-xl relative overflow-hidden" style={{ background: 'var(--bg-panel)' }}>
            <div
              className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-[0.05] pointer-events-none"
              style={{ background: 'radial-gradient(circle, var(--clay-orange) 0%, transparent 70%)', filter: 'blur(30px)', transform: 'translate(30%, -30%)' }}
            />
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2 relative z-10">
              <div className="flex items-center gap-2">
                <Star size={18} style={{ color: 'var(--clay-orange)' }} />
                <h2 className="font-black text-white">Pack de la Semana</h2>
                <span className="text-xs px-2 py-0.5 rounded-lg font-bold" style={{ background: 'var(--clay-orange)', color: 'var(--clay-ink)' }}>Novedades</span>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{weeklyPack.contents.length} títulos incluidos</p>
                <button 
                  onClick={async () => {
                    try {
                      setDownloadingId('pack');
                      const res = await API.RESELLER.getWeeklyPack();
                      if (res.success) {
                        alert(res.message);
                        loadData();
                      }
                    } catch (e: any) {
                      alert(e.message || 'Error al descargar pack');
                    } finally {
                      setDownloadingId(null);
                    }
                  }}
                  disabled={!!downloadingId || remaining < 10}
                  className="px-3 py-1.5 rounded-lg text-xs font-black transition-transform hover:scale-105 disabled:opacity-50"
                  style={{ background: 'var(--clay-orange)', color: 'var(--clay-ink)', border: '2px solid var(--clay-ink)', boxShadow: '2px 2px 0 var(--clay-ink)' }}
                >
                  {downloadingId === 'pack' ? 'Procesando...' : 'Descargar Pack (10 reqs)'}
                </button>
              </div>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {weeklyPack.contents.map(item => (
                <div key={item.id} className="shrink-0 w-28 group">
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-2"
                    style={{ border: '2px solid rgba(255,255,255,0.1)' }}>
                    {item.posterUrl ? (
                      <img src={item.posterUrl.startsWith('http') ? item.posterUrl : `${VPS_BASE_MOVIES}${item.posterUrl}`}
                        alt={item.title || ''} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl" style={{ background: 'var(--bg-panel)' }}>🎬</div>
                    )}
                    <button
                      onClick={() => handleDownload(item.id, item.title || '')}
                      disabled={!!downloadingId || remaining === 0}
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'rgba(0,0,0,0.7)' }}>
                      {downloadingId === item.id
                        ? <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin border-white" />
                        : <Download size={20} className="text-white" />}
                    </button>
                  </div>
                  <p className="text-xs font-bold text-white truncate">{item.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search + Filter */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-48 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Buscar título..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white outline-none focus:ring-2"
              style={{ background: 'var(--bg-panel)', border: '2px solid rgba(255,255,255,0.1)', color: 'var(--text-main)' }}
            />
          </div>
          <div className="flex gap-2">
            {['ALL', 'MOVIE', 'SERIES', 'ANIME'].map(t => (
              <button key={t}
                onClick={() => setTypeFilter(t)}
                className="px-3 py-2 rounded-xl text-xs font-bold transition-all border-2"
                style={typeFilter === t
                  ? { background: 'var(--clay-teal)', color: 'var(--clay-ink)', borderColor: 'var(--clay-ink)', boxShadow: '2px 2px 0 var(--clay-ink)' }
                  : { background: 'var(--bg-panel)', color: 'var(--text-muted)', borderColor: 'rgba(255,255,255,0.1)' }}>
                {t === 'ALL' ? 'Todo' : t === 'MOVIE' ? 'Películas' : t === 'SERIES' ? 'Series' : 'Anime'}
              </button>
            ))}
          </div>
        </div>

        {/* Content catalog */}
        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-xl shimmer" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {filtered.map(item => (
              <div key={item.id} className="group relative">
                <div className="aspect-[2/3] rounded-xl overflow-hidden relative"
                  style={{ border: '2px solid rgba(255,255,255,0.08)' }}>
                  {item.posterUrl ? (
                    <img
                      src={item.posterUrl.startsWith('http') ? item.posterUrl : `${VPS_BASE_MOVIES}${item.posterUrl}`}
                      alt={item.title || ''}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl" style={{ background: 'var(--bg-panel)' }}>🎬</div>
                  )}

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2"
                    style={{ background: 'rgba(0,0,0,0.8)' }}>
                    <button
                      onClick={() => handleDownload(item.id, item.title || '')}
                      disabled={!!downloadingId || remaining === 0}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-black transition-all disabled:opacity-50"
                      style={{ background: 'var(--clay-teal)', color: 'var(--clay-ink)', border: '2px solid var(--clay-ink)', boxShadow: '2px 2px 0 var(--clay-ink)' }}>
                      {downloadingId === item.id
                        ? <div className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin" />
                        : <><Download size={12} /> 1080p</>}
                    </button>
                    
                    <button
                      onClick={() => handleDownload(item.id, item.title || '', '4K HDR')}
                      disabled={!!downloadingId || remaining === 0}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-black transition-all disabled:opacity-50"
                      style={{ background: 'var(--clay-orange)', color: 'var(--clay-ink)', border: '2px solid var(--clay-ink)', boxShadow: '2px 2px 0 var(--clay-ink)' }}>
                      {downloadingId === item.id
                        ? <div className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin" />
                        : <><Download size={12} /> 4K HDR</>}
                    </button>

                    {remaining === 0 && (
                      <p className="text-[10px] text-center" style={{ color: '#ff5050' }}>Límite diario alcanzado</p>
                    )}
                  </div>

                  {/* Type badge */}
                  <div className="absolute top-1 left-1">
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md"
                      style={{ background: item.type === 'MOVIE' ? 'var(--clay-orange)' : item.type === 'SERIES' ? 'var(--clay-teal)' : 'var(--clay-purple)', color: 'var(--clay-ink)' }}>
                      {item.type === 'MOVIE' ? 'PELI' : item.type === 'SERIES' ? 'SERIE' : item.type}
                    </span>
                  </div>
                </div>
                <p className="text-xs font-bold mt-1.5 truncate text-white px-0.5">{item.title || item.id}</p>
                {item.rating && (
                  <p className="text-[10px]" style={{ color: 'var(--clay-yellow)' }}>★ {item.rating.toFixed(1)}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="font-bold text-white">No se encontraron resultados</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Intentá con otro término de búsqueda</p>
          </div>
        )}
      </div>
    </div>
  );
}
