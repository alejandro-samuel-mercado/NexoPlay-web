'use client';

import { useEffect, useState } from 'react';
import { Film, Eye, EyeOff, Download, Search } from 'lucide-react';
import { API, apiFetch } from '@/lib/api';

export default function ContenidoAdminPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [total, setTotal] = useState(0);

  const fetchContent = async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '30', ...(search ? { search } : {}), ...(type ? { type } : {}) });
    const res = await apiFetch(`${API.ADMIN.CONTENT}?${params}`);
    if (res.success) { setItems(res.data || []); setTotal(res.meta?.total || 0); }
    setLoading(false);
  };

  useEffect(() => { fetchContent(); }, [type]);

  const toggleVisibility = async (id: string, current: boolean) => {
    await apiFetch(API.ADMIN.CONTENT_VISIBILITY(id), {
      method: 'PATCH',
      body: JSON.stringify({ isVisible: !current }),
    });
    fetchContent();
  };

  const toggleDownloadable = async (id: string, current: boolean) => {
    await apiFetch(API.ADMIN.CONTENT_VISIBILITY(id), {
      method: 'PATCH',
      body: JSON.stringify({ isDownloadable: !current }),
    });
    fetchContent();
  };

  const updatePrice = async (id: string, price: number) => {
    await apiFetch(API.ADMIN.CONTENT_VISIBILITY(id), {
      method: 'PATCH',
      body: JSON.stringify({ price }),
    });
    // We don't fetchContent() immediately to avoid losing focus, just update local state if needed
    // or just let it save silently.
  };

  const handlePriceChange = (id: string, val: string) => {
    setItems((prev) => prev.map(item => item.id === id ? { ...item, price: parseFloat(val) || 0 } : item));
  };

  const handlePriceBlur = (id: string, currentPrice: number) => {
    updatePrice(id, currentPrice);
  };

  const TYPES = ['', 'MOVIE', 'SERIES', 'ANIME', 'DOCUMENTARY', 'NOVELA'];
  const TYPE_LABELS: Record<string, string> = {
    '': 'Todo', MOVIE: '🎬 Película', SERIES: '📺 Serie', ANIME: '⚡ Anime',
    DOCUMENTARY: '🎙️ Doc', NOVELA: '💫 Novela',
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Film size={24} style={{ color: 'var(--clay-orange)' }} /> Contenido
        </h1>
        <p className="text-sm text-[#6B7280]">{total} títulos — activá/desactivá visibilidad y descarga para NexoPlay</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex gap-2">
          {TYPES.map(t => (
            <button key={t} onClick={() => setType(t)}
              className={`clay-tag text-xs ${type === t ? 'active' : ''}`}>{TYPE_LABELS[t]}</button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); fetchContent(); }} className="flex gap-2 ml-auto">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..." className="clay-input pl-9 text-sm w-56" />
          </div>
          <button type="submit" className="btn-clay btn-clay-dark btn-clay-sm">Buscar</button>
        </form>
      </div>

      {/* Grid */}
      <div className="clay-card-dark rounded-[16px] overflow-hidden border-[2px] border-[#3A3A5C]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#3A3A5C]" style={{ background: '#1A1A2E' }}>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#6B7280] uppercase">Contenido</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#6B7280] uppercase">Tipo</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-[#6B7280] uppercase">Precio ($)</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-[#6B7280] uppercase">Visible</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-[#6B7280] uppercase">Descargable</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-[#6B7280] uppercase">Códigos</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="clay-skeleton h-6 rounded" /></td></tr>
                ))
                : items.map((item) => (
                  <tr key={item.id} className="border-b border-[#3A3A5C] hover:bg-white/5 transition-all">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {item.posterUrl ? (
                          <img src={item.posterUrl} alt="" className="w-8 h-12 object-cover rounded-[6px] border border-[#3A3A5C]" />
                        ) : (
                          <div className="w-8 h-12 rounded-[6px] bg-[#252540] flex items-center justify-center text-sm">🎬</div>
                        )}
                        <div>
                          <p className="font-semibold text-white text-xs max-w-48 truncate">{item.title}</p>
                          <p className="text-[#6B7280] text-[11px]">{item.releaseYear}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="clay-badge text-[10px] text-[#A8B3C8] border-[#3A3A5C]">{item.type}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <input 
                        type="number" 
                        value={item.price ?? 0}
                        onChange={(e) => handlePriceChange(item.id, e.target.value)}
                        onBlur={() => handlePriceBlur(item.id, item.price)}
                        className="w-20 bg-[#1A1A2E] text-white text-center rounded-[6px] border border-[#3A3A5C] py-1 text-xs focus:outline-none focus:border-[var(--clay-primary)]"
                        min="0"
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleVisibility(item.id, item.isVisible)}
                        className="p-2 rounded-[8px] transition-all hover:bg-white/10"
                        title={item.isVisible ? 'Ocultar' : 'Mostrar'}>
                        {item.isVisible
                          ? <Eye size={16} style={{ color: 'var(--clay-mint)' }} />
                          : <EyeOff size={16} className="text-[#3A3A5C]" />}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleDownloadable(item.id, item.isDownloadable)}
                        className="p-2 rounded-[8px] transition-all hover:bg-white/10"
                        title={item.isDownloadable ? 'Deshabilitar descarga' : 'Habilitar descarga'}>
                        <Download size={16} style={{ color: item.isDownloadable ? 'var(--clay-teal)' : '#3A3A5C' }} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-black text-sm" style={{ color: item.codesCount > 0 ? 'var(--clay-yellow)' : '#3A3A5C' }}>
                        {item.codesCount}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
