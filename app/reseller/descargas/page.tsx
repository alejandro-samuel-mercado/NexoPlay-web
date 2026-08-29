'use client';
import { useEffect, useState, useCallback } from 'react';
import { CheckCircle2, Download, Film, Search, Tv2, XCircle, Zap } from 'lucide-react';
import { API, apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const VPS = process.env.NEXT_PUBLIC_VPS_MOVIES_URL || '';

export default function ResellerDescargasPage() {
  const { user } = useAuth();
  const [catalog, setCatalog] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3500); };

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [cat, st] = await Promise.all([
      apiFetch(`${API.CONTENT.BASE}?limit=100&lang=es`).catch(() => null),
      apiFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/reseller/stats`).catch(() => null),
    ]);
    if (cat?.data) setCatalog(cat.data);
    if (st?.data) setStats(st.data);
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleDownload = async (contentId: string, title: string, quality = '1080p') => {
    setDownloadingId(contentId + quality);
    try {
      const res = await apiFetch(API.DOWNLOADS.DOWNLOAD(contentId), { method: 'POST', body: JSON.stringify({ quality }) });
      if (res?.data?.downloadUrl) {
        window.open(res.data.downloadUrl, '_blank');
        showToast(`Descarga iniciada: ${title} (${quality})`);
        // Refresh stats
        apiFetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/reseller/stats`).then(r => { if (r?.data) setStats(r.data); });
      } else {
        showToast(res?.message || 'Error al generar link', false);
      }
    } catch (e: any) { showToast(e.message || 'Error al descargar', false); }
    finally { setDownloadingId(null); }
  };

  const filtered = catalog.filter(item => {
    const matchSearch = !search || (item.title || item.originalTitle || '').toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'ALL' || item.type === typeFilter;
    return matchSearch && matchType && item.videoFiles?.length > 0;
  });

  const remaining = stats ? stats.dailyRemaining : null;
  const pct = stats ? Math.min(100, (stats.dailyUsed / (stats.dailyLimit || 1)) * 100) : 0;
  const posterUrl = (item: any) => {
    const url = item.posterUrl || item.thumbnails?.[0]?.url;
    return url ? (url.startsWith('http') ? url : `${VPS}${url}`) : null;
  };

  return (
    <div className="p-6 sm:p-8">
      {toast && (
        <div className="fixed top-5 right-5 z-[200] px-4 py-3 rounded-xl text-sm font-bold shadow-2xl flex items-center gap-2"
          style={{ background: toast.ok ? '#34D399' : '#EF4444', color: '#0a0f0a' }}>
          {toast.ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />} {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Download size={28} style={{ color: '#34D399' }} /> Catálogo & Descargas
          </h1>
          <p className="text-sm mt-1" style={{ color: '#6B7280' }}>{filtered.length} títulos disponibles</p>
        </div>
        {stats && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-bold"
              style={{ borderColor: remaining === 0 ? 'rgba(239,68,68,0.4)' : 'rgba(52,211,153,0.4)', color: remaining === 0 ? '#EF4444' : '#34D399', background: remaining === 0 ? 'rgba(239,68,68,0.08)' : 'rgba(52,211,153,0.08)' }}>
              <Download size={14} /> {stats.dailyUsed}/{stats.dailyLimit} hoy
            </div>
            {remaining === 0 && (
              <Link href="/reseller/tokens" className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                style={{ background: 'rgba(234,179,8,0.1)', color: '#EAB308', border: '1px solid rgba(234,179,8,0.3)' }}>
                <Zap size={12} /> Comprar más
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Daily progress mini-bar */}
      {stats && (
        <div className="h-1.5 rounded-full mb-6 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: pct >= 90 ? '#EF4444' : '#34D399' }} />
        </div>
      )}

      {/* Search + filters */}
      <div className="flex gap-3 flex-wrap mb-6">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#6B7280' }} />
          <input type="text" placeholder="Buscar título..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white outline-none"
            style={{ background: 'var(--bg-panel)', border: '2px solid rgba(255,255,255,0.08)', color: 'var(--text-main)' }} />
        </div>
        <div className="flex gap-2">
          {[{ k: 'ALL', label: 'Todos', icon: null }, { k: 'MOVIE', label: 'Películas', icon: Film }, { k: 'SERIES', label: 'Series', icon: Tv2 }].map(({ k, label, icon: Icon }) => (
            <button key={k} onClick={() => setTypeFilter(k)}
              className="px-3 py-2.5 rounded-xl text-xs font-bold transition-all border-2 flex items-center gap-1.5"
              style={typeFilter === k
                ? { background: '#34D399', color: '#0a0f0a', borderColor: '#34D399' }
                : { background: 'var(--bg-panel)', color: '#6B7280', borderColor: 'rgba(255,255,255,0.08)' }}>
              {Icon && <Icon size={13} />} {label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-3">
          {Array.from({ length: 27 }).map((_, i) => <div key={i} className="aspect-[2/3] rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24">
          <Search size={48} className="mx-auto mb-4 opacity-20 text-white" />
          <p className="font-bold text-white">Sin resultados</p>
          <p className="text-sm mt-1" style={{ color: '#6B7280' }}>Probá con otro término de búsqueda</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-3">
          {filtered.map(item => {
            const thumb = posterUrl(item);
            const title = item.title || item.originalTitle || item.id;
            return (
              <div key={item.id} className="group relative">
                <div className="aspect-[2/3] rounded-xl overflow-hidden relative" style={{ border: '2px solid rgba(255,255,255,0.07)' }}>
                  {thumb
                    ? <img src={thumb} alt={title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    : <div className="w-full h-full flex items-center justify-center text-3xl" style={{ background: 'rgba(255,255,255,0.03)' }}>🎬</div>}

                  {/* Overlay */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1.5"
                    style={{ background: 'rgba(0,0,0,0.88)' }}>
                    <button onClick={() => handleDownload(item.id, title, '1080p')}
                      disabled={!!downloadingId || remaining === 0}
                      className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-black disabled:opacity-40 transition-transform hover:scale-105"
                      style={{ background: '#34D399', color: '#0a0f0a' }}>
                      {downloadingId === item.id + '1080p' ? <div className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#0a0f0a', borderTopColor: 'transparent' }} /> : <><Download size={11} /> 1080p</>}
                    </button>
                    <button onClick={() => handleDownload(item.id, title, '4K HDR')}
                      disabled={!!downloadingId || remaining === 0}
                      className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-black disabled:opacity-40 transition-transform hover:scale-105"
                      style={{ background: '#F59E0B', color: '#0a0f0a' }}>
                      {downloadingId === item.id + '4K HDR' ? <div className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#0a0f0a', borderTopColor: 'transparent' }} /> : <><Download size={11} /> 4K HDR</>}
                    </button>
                    {remaining === 0 && <p className="text-[9px] font-bold" style={{ color: '#EF4444' }}>Límite alcanzado</p>}
                  </div>

                  {/* Type badge */}
                  <div className="absolute top-1 left-1">
                    <span className="text-[8px] font-black px-1.5 py-0.5 rounded-md"
                      style={{ background: item.type === 'MOVIE' ? '#F59E0B' : '#34D399', color: '#0a0f0a' }}>
                      {item.type === 'MOVIE' ? 'PELI' : 'SERIE'}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] font-bold mt-1.5 truncate text-white px-0.5">{title}</p>
                {item.rating && <p className="text-[10px]" style={{ color: '#EAB308' }}>★ {Number(item.rating).toFixed(1)}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
