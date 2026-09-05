'use client';
import { useEffect, useState } from 'react';
import { CheckCircle2, Download, Package, Star, XCircle } from 'lucide-react';
import { API, apiFetch } from '@/lib/api';

const VPS = process.env.NEXT_PUBLIC_VPS_MOVIES_URL || '';

export default function ResellerPackPage() {
  const [pack, setPack] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [claimedAt, setClaimedAt] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3500); };

  useEffect(() => {
    apiFetch(API.TOKENS.WEEKLY_PACK).then(r => {
      if (r?.data) setPack(r.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleDownloadPack = async () => {
    setDownloading(true);
    try {
      const res = await API.RESELLER.getWeeklyPack();
      if (res.success) {
        showToast(res.data?.message || 'Pack descargado exitosamente');
        setClaimed(true);
      } else {
        showToast(res.error || 'Error al descargar pack', false);
      }
    } catch (e: any) {
      if (e.message?.includes('ya descargaste') || e.message?.includes('Solo se puede reclamar')) {
        setClaimed(true);
        showToast(e.message, false);
      } else {
        showToast(e.message || 'Error al descargar pack', false);
      }
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadSingle = async (contentId: string, title: string) => {
    try {
      const res = await apiFetch(API.DOWNLOADS.DOWNLOAD(contentId), { method: 'POST', body: JSON.stringify({ quality: '1080p' }) });
      if (res?.data?.downloadUrl) {
        window.open(res.data.downloadUrl, '_blank');
        showToast(`Descarga iniciada: ${title}`);
      } else {
        showToast(res?.message || 'Error al generar link', false);
      }
    } catch (e: any) {
      showToast(e.message || 'Error al descargar', false);
    }
  };

  const contents = pack?.contents || [];
  const posterUrl = (url: string) => url?.startsWith('http') ? url : `${VPS}${url}`;

  return (
    <div className="p-6 sm:p-8">
      {toast && (
        <div className="fixed top-5 right-5 z-[200] px-4 py-3 rounded-xl text-sm font-bold shadow-2xl flex items-center gap-2"
          style={{ background: toast.ok ? '#34D399' : '#EF4444', color: '#0a0f0a' }}>
          {toast.ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />} {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Package size={28} style={{ color: '#F59E0B' }} /> Pack Semanal
          </h1>
          <p className="text-sm mt-1" style={{ color: '#6B7280' }}>Descargá todos los títulos de la semana de una sola vez</p>
        </div>
        {pack && !claimed && (
          <button onClick={handleDownloadPack} disabled={downloading}
            className="px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all disabled:opacity-50"
            style={{ background: '#F59E0B', color: '#0a0f0a', boxShadow: '0 4px 15px rgba(245,158,11,0.3)' }}>
            {downloading
              ? <><div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#0a0f0a', borderTopColor: 'transparent' }} /> Procesando...</>
              : <><Download size={16} /> Descargar Pack ({contents.length} títulos)</>}
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-[2/3] rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />)}
        </div>
      ) : !pack ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <Package size={64} className="mb-4 opacity-20 text-white" />
          <h2 className="text-xl font-black text-white mb-2">Sin Pack Activo</h2>
          <p style={{ color: '#6B7280' }}>El administrador aún no ha publicado el pack de esta semana.</p>
        </div>
      ) : (
        <>
          {/* Pack header */}
          <div className="rounded-[20px] border border-white/5 p-6 mb-6 flex items-center gap-4" style={{ background: 'var(--bg-panel)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }}>
              <Star size={22} />
            </div>
            <div className="flex-1">
              <h2 className="font-black text-white text-lg">{pack.title}</h2>
              <p className="text-sm" style={{ color: '#6B7280' }}>{contents.length} títulos incluidos</p>
            </div>
            {claimed && (
              <span className="text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5" style={{ background: 'rgba(52,211,153,0.1)', color: '#34D399', border: '1px solid rgba(52,211,153,0.2)' }}>
                <CheckCircle2 size={13} /> Ya descargado
              </span>
            )}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {contents.map((item: any) => (
              <div key={item.id} className="group relative">
                <div className="aspect-[2/3] rounded-2xl overflow-hidden relative" style={{ border: '2px solid rgba(255,255,255,0.08)' }}>
                  {item.posterUrl || item.thumbnails?.[0]?.url ? (
                    <img src={posterUrl(item.posterUrl || item.thumbnails?.[0]?.url)} alt={item.title || item.originalTitle || ''} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl" style={{ background: 'rgba(255,255,255,0.03)' }}>🎬</div>
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.8)' }}>
                    <button onClick={() => handleDownloadSingle(item.id, item.title || item.originalTitle || '')}
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                      style={{ background: '#34D399', color: '#0a0f0a' }}>
                      <Download size={18} strokeWidth={3} />
                    </button>
                  </div>
                  {/* Type badge */}
                  <div className="absolute top-2 left-2">
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md"
                      style={{ background: item.type === 'MOVIE' ? '#F59E0B' : '#34D399', color: '#0a0f0a' }}>
                      {item.type === 'MOVIE' ? 'PELI' : 'SERIE'}
                    </span>
                  </div>
                  {/* Rating */}
                  {item.rating && (
                    <div className="absolute bottom-2 right-2">
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-black/70 text-yellow-400">★ {Number(item.rating).toFixed(1)}</span>
                    </div>
                  )}
                </div>
                <p className="text-[11px] font-bold mt-2 truncate text-white px-0.5">
                  {item.title || item.originalTitle || item.id}
                </p>
                {item.releaseYear && <p className="text-[10px]" style={{ color: '#6B7280' }}>{item.releaseYear}</p>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
