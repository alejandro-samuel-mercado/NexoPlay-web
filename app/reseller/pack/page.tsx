'use client';

import { useAuth } from '@/context/AuthContext';
import { Package, Search, Plus, Trash2, X, ChevronRight, Download, RefreshCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ResellerPackPage() {
  const { user } = useAuth();
  
  const [myPacks, setMyPacks] = useState<any[]>([]);
  const [availablePacks, setAvailablePacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create mode state
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedContents, setSelectedContents] = useState<any[]>([]);
  const [creating, setCreating] = useState(false);
  
  const fetchPacks = async () => {
    setLoading(true);
    const [mineRes, availRes] = await Promise.all([
      apiFetch(`${API_BASE}/api/reseller/pack/weekly/mine`),
      apiFetch(`${API_BASE}/api/reseller/pack/weekly/available`)
    ]);
    if (mineRes.success) setMyPacks(mineRes.data || []);
    if (availRes.success) setAvailablePacks(availRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchPacks();
  }, [user]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!search.trim()) return;
    
    setSearching(true);
    const res = await apiFetch(`${API_BASE}/api/content?search=${encodeURIComponent(search)}&limit=10`);
    if (res.success) {
      setSearchResults(res.data || []);
    }
    setSearching(false);
  };

  const addContent = (c: any) => {
    if (selectedContents.find(x => x.id === c.id)) return;
    setSelectedContents([...selectedContents, c]);
  };

  const removeContent = (id: string) => {
    setSelectedContents(selectedContents.filter(c => c.id !== id));
  };

  const handleCreate = async () => {
    if (!title.trim()) return alert('Ingrese un título para el pack');
    if (selectedContents.length === 0) return alert('Seleccione al menos un contenido');
    
    setCreating(true);
    const res = await apiFetch(`${API_BASE}/api/reseller/pack/weekly/create`, {
      method: 'POST',
      body: JSON.stringify({
        title,
        contentIds: selectedContents.map(c => c.id)
      })
    });
    setCreating(false);
    
    if (res.success) {
      alert('Pack creado con éxito');
      setIsCreating(false);
      setTitle('');
      setSelectedContents([]);
      setSearch('');
      setSearchResults([]);
      fetchPacks();
    } else {
      alert(res.error || 'Error al crear el pack');
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Space Grotesk' }}>Mis Packs Semanales</h1>
          <p className="text-white/50 text-sm mt-1">Gestiona los packs que ofreces a tu red de clientes</p>
        </div>
        
        {!isCreating && (
          <button 
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#34D399] hover:bg-[#34D399]/90 text-black font-black text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(52,211,153,0.3)] hover:scale-105"
          >
            <Plus size={16} /> Crear Nuevo Pack
          </button>
        )}
      </div>

      {isCreating ? (
        <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-2xl mb-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Package size={20} className="text-[#34D399]" /> Nuevo Pack Semanal
            </h2>
            <button onClick={() => setIsCreating(false)} className="text-white/40 hover:text-white bg-white/5 p-2 rounded-lg transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left side: Form & Search */}
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-white/70 mb-2 uppercase tracking-wider">Título del Pack</label>
                <input 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="Ej: Estrenos Semanales - Octubre 1"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#34D399] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/70 mb-2 uppercase tracking-wider">Buscar Contenido</label>
                <form onSubmit={handleSearch} className="relative flex gap-2">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                    <input 
                      value={search} 
                      onChange={e => setSearch(e.target.value)} 
                      placeholder="Buscar películas o series..."
                      className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#34D399] transition-colors"
                    />
                  </div>
                  <button type="submit" disabled={searching} className="px-4 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center">
                    {searching ? <RefreshCcw size={16} className="animate-spin" /> : 'Buscar'}
                  </button>
                </form>
              </div>

              {searchResults.length > 0 && (
                <div className="bg-black/20 border border-white/5 rounded-xl max-h-60 overflow-y-auto p-2 space-y-1 hide-scrollbar">
                  {searchResults.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-12 bg-white/10 rounded overflow-hidden flex-shrink-0">
                          {c.posterUrl && <img src={c.posterUrl} alt={c.title} className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white line-clamp-1">{c.title}</p>
                          <p className="text-xs text-white/50 uppercase">{c.type}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => addContent(c)}
                        disabled={selectedContents.some(x => x.id === c.id)}
                        className="p-1.5 bg-[#34D399]/10 text-[#34D399] hover:bg-[#34D399]/20 rounded-lg disabled:opacity-30 transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right side: Selected Contents */}
            <div className="bg-black/30 rounded-xl p-5 border border-white/5 flex flex-col">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center justify-between">
                <span>Contenido Seleccionado</span>
                <span className="bg-[#34D399]/20 text-[#34D399] px-2 py-0.5 rounded-full text-xs">{selectedContents.length} items</span>
              </h3>
              
              <div className="flex-1 overflow-y-auto space-y-2 max-h-[300px] hide-scrollbar mb-4">
                {selectedContents.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-white/30 text-center p-4">
                    <Package size={32} className="mb-2 opacity-50" />
                    <p className="text-sm">No has agregado ningún contenido al pack</p>
                  </div>
                ) : (
                  selectedContents.map(c => (
                    <div key={c.id} className="flex items-center justify-between p-2 bg-white/5 border border-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-12 bg-white/10 rounded overflow-hidden flex-shrink-0">
                          {c.posterUrl && <img src={c.posterUrl} alt={c.title} className="w-full h-full object-cover" />}
                        </div>
                        <p className="text-sm font-bold text-white line-clamp-1">{c.title}</p>
                      </div>
                      <button onClick={() => removeContent(c.id)} className="p-2 text-[#FF6B6B] hover:bg-[#FF6B6B]/10 rounded-lg transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <button 
                onClick={handleCreate}
                disabled={creating || selectedContents.length === 0}
                className="w-full py-3 bg-[#34D399] text-black font-black text-sm rounded-xl hover:bg-[#34D399]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {creating ? 'Creando...' : 'Guardar y Publicar Pack'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Available Packs Section */}
          <div className="mb-12">
            <h2 className="text-xl font-bold text-white mb-4">Packs Disponibles para Descargar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                Array.from({length: 3}).map((_, i) => (
                  <div key={`avail-sk-${i}`} className="h-40 bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-2xl animate-pulse" />
                ))
              ) : availablePacks.length === 0 ? (
                <div className="col-span-full py-12 flex flex-col items-center justify-center text-center bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-2xl border-dashed">
                  <Package size={32} className="text-white/20 mb-3" />
                  <h3 className="text-md font-bold text-white mb-1">No hay packs disponibles</h3>
                </div>
              ) : (
                availablePacks.map(pack => (
                  <div key={pack.id} className="bg-[var(--bg-panel)] border border-[#34D399]/30 rounded-2xl p-5 relative overflow-hidden transition-all hover:border-[#34D399]/60">
                    <h3 className="text-lg font-bold text-white mb-1">{pack.title}</h3>
                    <p className="text-xs text-[#34D399] mb-1 uppercase tracking-wider font-bold">
                      Creado por: {pack.creator?.name || pack.creator?.username || 'Admin'} ({pack.creator?.role || 'ADMIN'})
                    </p>
                    <p className="text-xs text-white/40 mb-4">{new Date(pack.createdAt).toLocaleDateString()}</p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-lg border border-white/5 text-sm font-bold text-white">
                        <Film size={14} className="text-[#34D399]" /> {pack.contentIds?.length || 0} items
                      </div>
                      <button 
                        onClick={async () => {
                          if (!confirm(`¿Descargar pack "${pack.title}"? Consumirá descargas diarias.`)) return;
                          const res = await apiFetch(`${API_BASE}/api/reseller/pack/weekly/${pack.id}/claim`, { method: 'POST' });
                          if (res.success) {
                            alert(res.message);
                            fetchPacks();
                          } else {
                            alert(res.error || 'Error al descargar');
                          }
                        }}
                        className="px-4 py-2 bg-[#34D399]/10 text-[#34D399] hover:bg-[#34D399]/20 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors"
                      >
                        <Download size={14} /> Reclamar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* My Packs Section */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Packs que he creado</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                Array.from({length: 3}).map((_, i) => (
                  <div key={`my-sk-${i}`} className="h-40 bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-2xl animate-pulse" />
                ))
              ) : myPacks.length === 0 ? (
                <div className="col-span-full py-12 flex flex-col items-center justify-center text-center bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-2xl border-dashed">
                  <Package size={32} className="text-white/20 mb-3" />
                  <h3 className="text-md font-bold text-white mb-1">No has creado ningún pack</h3>
                </div>
              ) : (
                myPacks.map(pack => (
                  <div key={pack.id} className={`bg-[var(--bg-panel)] border rounded-2xl p-5 relative overflow-hidden transition-all hover:border-white/20 group ${pack.isActive ? 'border-[#34D399]/30' : 'border-white/5'}`}>
                    {pack.isActive && (
                      <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                        <div className="absolute top-3 -right-6 bg-[#34D399] text-black text-[9px] font-black uppercase tracking-widest py-1 px-8 rotate-45">Activo</div>
                      </div>
                    )}
                    
                    <h3 className="text-lg font-bold text-white mb-1 pr-12">{pack.title}</h3>
                    <p className="text-xs text-white/40 mb-4">{new Date(pack.createdAt).toLocaleDateString()}</p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1.5 rounded-lg border border-white/5 text-sm font-bold text-white">
                        <Film size={14} className="text-[#34D399]" /> {pack.contentIds?.length || 0} items
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Simple Film icon component if lucide-react Film is not imported above (we forgot it)
function Film(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={props.size||24} height={props.size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>
}
