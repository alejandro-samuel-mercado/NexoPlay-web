'use client';

import { useState, useEffect } from 'react';
import { API, apiFetch } from '@/lib/api';

import { CheckCircle, XCircle, Clock, Film, Tv } from 'lucide-react';


type Suggestion = {
  id: string;
  tmdbId: string;
  tmdbType: string;
  title: string;
  posterUrl: string | null;
  year: number | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNotes: string | null;
  createdAt: string;
  user: { name: string; email: string };
};

export default function SocialSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const res = await apiFetch(API.SOCIAL_ADMIN.SUGGESTIONS);
      setSuggestions(res.data);
    } catch (error) {
      alert('Error al cargar sugerencias');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const note = prompt(`Opcional: Dejá una nota para el usuario sobre por qué fue ${status === 'APPROVED' ? 'aprobada' : 'rechazada'}`);
    if (note === null) return; // Cancelled

    setUpdatingId(id);
    try {
      await apiFetch(API.SOCIAL_ADMIN.SUGGESTION(id), {
        method: 'PUT',
        body: JSON.stringify({ status, adminNotes: note || undefined }),
      });
      alert(`Sugerencia ${status === 'APPROVED' ? 'aprobada' : 'rechazada'} correctamente`);
      fetchSuggestions();
    } catch (error) {
      alert('Error al actualizar estado');
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = filter === 'ALL' ? suggestions : suggestions.filter(s => s.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Sugerencias de la Comunidad</h2>
          <p className="text-sm text-[#8B8FA8]">Aprobá o rechazá las películas/series que piden los usuarios. Aprobarlas les otorgará créditos automáticamente.</p>
        </div>
        
        <div className="flex bg-[#1E1E3A] border border-[var(--border-subtle)] p-1 rounded-lg">
          {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                filter === f ? 'bg-[#E82C7C] text-white' : 'text-[#8B8FA8] hover:text-white'
              }`}
            >
              {f === 'ALL' ? 'Todas' : f === 'PENDING' ? 'Pendientes' : f === 'APPROVED' ? 'Aprobadas' : 'Rechazadas'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 rounded-full border-4 border-[#E82C7C] border-t-transparent animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-[#1E1E3A] border border-[var(--border-subtle)] rounded-xl">
          <p className="text-[#8B8FA8]">No hay sugerencias en esta categoría.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(s => (
            <div key={s.id} className="bg-[#1E1E3A] border border-[var(--border-subtle)] rounded-xl overflow-hidden flex flex-col">
              <div className="flex p-4 gap-4">
                {s.posterUrl ? (
                  <img src={s.posterUrl} alt={s.title} className="w-20 h-28 object-cover rounded-md bg-black" />
                ) : (
                  <div className="w-20 h-28 bg-[#2A2A4A] rounded-md flex items-center justify-center">
                    {s.tmdbType === 'movie' ? <Film className="text-[#8B8FA8]" /> : <Tv className="text-[#8B8FA8]" />}
                  </div>
                )}
                
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-white text-base leading-tight" title={s.title}>
                      {s.title}
                    </h3>
                  </div>
                  <p className="text-xs text-[#8B8FA8] mt-1">
                    {s.tmdbType === 'movie' ? 'Película' : 'Serie'} • {s.year || 'N/A'}
                  </p>
                  
                  <div className="mt-auto pt-2">
                    <p className="text-[10px] font-bold text-[#E82C7C] uppercase tracking-wider mb-1">Sugerido por</p>
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#E82C7C]/20 flex items-center justify-center text-[10px] font-bold text-[#E82C7C]">
                        {s.user.name.charAt(0).toUpperCase()}
                      </div>
                      <p className="text-xs text-white truncate">{s.user.name}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-black/20 p-3 border-t border-[var(--border-subtle)] flex items-center justify-between mt-auto">
                <div className="flex items-center gap-1.5">
                  {s.status === 'PENDING' ? <Clock size={14} className="text-yellow-500" /> :
                   s.status === 'APPROVED' ? <CheckCircle size={14} className="text-green-500" /> :
                   <XCircle size={14} className="text-red-500" />}
                  <span className={`text-xs font-bold ${
                    s.status === 'PENDING' ? 'text-yellow-500' :
                    s.status === 'APPROVED' ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {s.status === 'PENDING' ? 'Pendiente' : s.status === 'APPROVED' ? 'Aprobada' : 'Rechazada'}
                  </span>
                </div>
                
                {s.status === 'PENDING' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateStatus(s.id, 'REJECTED')}
                      disabled={updatingId === s.id}
                      className="px-3 py-1 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-bold transition-all disabled:opacity-50"
                    >
                      Rechazar
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(s.id, 'APPROVED')}
                      disabled={updatingId === s.id}
                      className="px-3 py-1 rounded-md bg-green-500 text-black hover:bg-green-400 text-xs font-bold transition-all disabled:opacity-50"
                    >
                      Aprobar
                    </button>
                  </div>
                )}
              </div>
              
              {s.adminNotes && (
                <div className="px-4 py-2 bg-black/40 border-t border-[var(--border-subtle)]">
                  <p className="text-[10px] text-[#8B8FA8] uppercase tracking-wider font-bold">Nota al usuario:</p>
                  <p className="text-xs text-white mt-1 italic">"{s.adminNotes}"</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
