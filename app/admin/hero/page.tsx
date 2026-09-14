'use client';

import { API, apiFetch } from '@/lib/api';
import {
  CheckCircle2,
  Film,
  GripVertical,
  Layers,
  Loader2,
  Save,
  Search,
  Shuffle,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

type HeroMode = 'estrenos' | 'recientes' | 'mixto' | 'manual';

interface ContentItem {
  id: string;
  title: string;
  slug: string;
  type: string;
  releaseYear?: number;
  posterUrl?: string | null;
}

interface HeroConfig {
  heroMode: HeroMode;
  heroLimit: number;
  manualIds: string[];
  manualItems: ContentItem[];
}

const MODES = [
  {
    key: 'estrenos' as HeroMode,
    label: 'Estrenos',
    description: 'Muestra el contenido más reciente del año actual, ordenado por fecha de incorporación.',
    icon: <Sparkles size={22} />,
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, rgba(245,158,11,0.18) 0%, rgba(245,158,11,0.05) 100%)',
  },
  {
    key: 'recientes' as HeroMode,
    label: 'Recién Agregados',
    description: 'Muestra el contenido incorporado más recientemente a la plataforma, sin importar el año.',
    icon: <TrendingUp size={22} />,
    color: '#10B981',
    gradient: 'linear-gradient(135deg, rgba(16,185,129,0.18) 0%, rgba(16,185,129,0.05) 100%)',
  },
  {
    key: 'mixto' as HeroMode,
    label: 'Mixto',
    description: 'Mezcla automática de estrenos y tendencias. Se rota aleatoriamente en cada visita.',
    icon: <Shuffle size={22} />,
    color: '#8B5CF6',
    gradient: 'linear-gradient(135deg, rgba(139,92,246,0.18) 0%, rgba(139,92,246,0.05) 100%)',
  },
  {
    key: 'manual' as HeroMode,
    label: 'Manual',
    description: 'Vos elegís exactamente qué títulos aparecen en el Hero, en el orden que quieras.',
    icon: <Layers size={22} />,
    color: '#3B82F6',
    gradient: 'linear-gradient(135deg, rgba(59,130,246,0.18) 0%, rgba(59,130,246,0.05) 100%)',
  },
];

export default function HeroConfigPage() {
  const [config, setConfig] = useState<HeroConfig>({
    heroMode: 'mixto',
    heroLimit: 10,
    manualIds: [],
    manualItems: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQ, setSearchQ] = useState('');
  const [searchResults, setSearchResults] = useState<ContentItem[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dragItem = useRef<number | null>(null);
  const dragOver = useRef<number | null>(null);

  useEffect(() => {
    apiFetch(API.ADMIN.HERO_CONFIG)
      .then((res) => { if (res.success) setConfig(res.data); })
      .catch(() => setError('No se pudo cargar la configuración del Hero.'))
      .finally(() => setLoading(false));
  }, []);

  const doSearch = useCallback(async (q: string, selectedIds: string[]) => {
    setSearching(true);
    try {
      const res = await apiFetch(`${API.ADMIN.HERO_SEARCH}?q=${encodeURIComponent(q)}&limit=20`);
      if (res.success) {
        const selected = new Set(selectedIds);
        setSearchResults((res.data as ContentItem[]).filter((c) => !selected.has(c.id)));
      }
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (config.heroMode !== 'manual') return;
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => doSearch(searchQ, config.manualIds), 300);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [searchQ, config.heroMode, config.manualIds, doSearch]);

  const handleModeChange = (mode: HeroMode) => {
    setConfig((prev) => ({ ...prev, heroMode: mode }));
    setSaved(false);
    if (mode === 'manual') doSearch('', config.manualIds);
  };

  const handleLimitChange = (val: number) => {
    setConfig((prev) => ({ ...prev, heroLimit: val }));
    setSaved(false);
  };

  const addItem = (item: ContentItem) => {
    if (config.manualItems.length >= 15) return;
    if (config.manualIds.includes(item.id)) return;
    setConfig((prev) => ({
      ...prev,
      manualIds: [...prev.manualIds, item.id],
      manualItems: [...prev.manualItems, item],
    }));
    setSearchResults((prev) => prev.filter((c) => c.id !== item.id));
    setSaved(false);
  };

  const removeItem = (id: string) => {
    const newIds = config.manualIds.filter((x) => x !== id);
    setConfig((prev) => ({
      ...prev,
      manualIds: newIds,
      manualItems: prev.manualItems.filter((x) => x.id !== id),
    }));
    setSaved(false);
    doSearch(searchQ, newIds);
  };

  const handleDragStart = (index: number) => { dragItem.current = index; };
  const handleDragEnter = (index: number) => { dragOver.current = index; };
  const handleDragEnd = () => {
    if (dragItem.current === null || dragOver.current === null) return;
    if (dragItem.current === dragOver.current) { dragItem.current = null; dragOver.current = null; return; }
    const items = [...config.manualItems];
    const ids = [...config.manualIds];
    const [movedItem] = items.splice(dragItem.current, 1);
    const [movedId] = ids.splice(dragItem.current, 1);
    items.splice(dragOver.current, 0, movedItem);
    ids.splice(dragOver.current, 0, movedId);
    setConfig((prev) => ({ ...prev, manualItems: items, manualIds: ids }));
    dragItem.current = null;
    dragOver.current = null;
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await apiFetch(API.ADMIN.HERO_CONFIG, {
        method: 'POST',
        body: JSON.stringify({
          heroMode: config.heroMode,
          heroLimit: config.heroLimit,
          manualIds: config.heroMode === 'manual' ? config.manualIds : [],
        }),
      });
      if (res.success) { setSaved(true); setTimeout(() => setSaved(false), 3500); }
      else setError(res.error || 'Error al guardar');
    } catch (err: any) {
      setError(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const typeLabel = (t: string) => {
    const map: Record<string, string> = {
      MOVIE: 'Película', SERIES: 'Serie', ANIME: 'Anime',
      NOVELA: 'Novela', DOCUMENTARY: 'Documental', ANIMATION: 'Animación',
    };
    return map[t] || t;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4 max-w-4xl mx-auto">
        <div className="clay-skeleton h-10 w-56 rounded-[12px]" />
        <div className="clay-skeleton h-5 w-80 rounded-[8px]" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[1, 2, 3, 4].map((i) => <div key={i} className="clay-skeleton h-36 rounded-[18px]" />)}
        </div>
        <div className="clay-skeleton h-24 rounded-[16px] mt-4" />
      </div>
    );
  }

  const activeMode = MODES.find((m) => m.key === config.heroMode)!;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Film size={24} style={{ color: 'var(--color-primary)' }} />
            Configuración del Hero
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Definí qué contenido aparece en el carrusel principal del Home.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-[12px] font-bold text-sm transition-all disabled:opacity-50"
          style={{
            background: saved ? 'rgba(16,185,129,0.2)' : 'var(--color-primary)',
            color: saved ? '#10B981' : '#fff',
            border: saved ? '1.5px solid #10B981' : 'none',
          }}
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
          {saving ? 'Guardando…' : saved ? '¡Guardado!' : 'Guardar'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-[12px] bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold">
          <X size={16} />{error}
        </div>
      )}

      {/* Mode selector */}
      <section>
        <h2 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] mb-3">
          Modo de selección
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {MODES.map((mode) => {
            const isActive = config.heroMode === mode.key;
            return (
              <button
                key={mode.key}
                onClick={() => handleModeChange(mode.key)}
                className="text-left p-4 rounded-[18px] border transition-all duration-200"
                style={{
                  background: isActive ? mode.gradient : 'var(--bg-card)',
                  borderColor: isActive ? mode.color : 'var(--border-subtle)',
                  boxShadow: isActive ? `0 0 0 2px ${mode.color}40` : 'none',
                }}
              >
                <div
                  className="w-10 h-10 rounded-[10px] flex items-center justify-center mb-3"
                  style={{
                    background: isActive ? `${mode.color}30` : 'rgba(255,255,255,0.05)',
                    color: isActive ? mode.color : '#6B7280',
                  }}
                >
                  {mode.icon}
                </div>
                <p className="font-black text-sm mb-1" style={{ color: isActive ? mode.color : '#fff' }}>
                  {mode.label}
                </p>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">{mode.description}</p>
                {isActive && (
                  <div
                    className="mt-3 inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{ background: `${mode.color}25`, color: mode.color }}
                  >
                    <Star size={9} fill="currentColor" /> Activo
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Limit slider (non-manual) */}
      {config.heroMode !== 'manual' && (
        <section className="p-5 rounded-[18px] border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="font-black text-white text-sm">Cantidad de ítems en el Hero</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Modo <span style={{ color: activeMode.color }}>{activeMode.label}</span> — máximo 15 ítems
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleLimitChange(Math.max(3, config.heroLimit - 1))}
                className="w-9 h-9 rounded-[8px] flex items-center justify-center text-white font-black transition-all hover:bg-white/10"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-subtle)' }}
              >−</button>
              <span className="text-2xl font-black w-10 text-center" style={{ color: activeMode.color }}>
                {config.heroLimit}
              </span>
              <button
                onClick={() => handleLimitChange(Math.min(15, config.heroLimit + 1))}
                className="w-9 h-9 rounded-[8px] flex items-center justify-center text-white font-black transition-all hover:bg-white/10"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-subtle)' }}
              >+</button>
            </div>
          </div>
        </section>
      )}

      {/* Manual mode */}
      {config.heroMode === 'manual' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Selección manual</h2>
            <span className="text-xs font-black px-2 py-0.5 rounded-full" style={{ background: 'rgba(59,130,246,0.15)', color: '#3B82F6' }}>
              {config.manualItems.length} / 15 seleccionados
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Search panel */}
            <div className="rounded-[18px] border overflow-hidden" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
              <div className="p-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="flex items-center gap-2 px-3 py-2 rounded-[10px]" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  {searching ? <Loader2 size={15} className="animate-spin text-[var(--text-muted)]" /> : <Search size={15} className="text-[var(--text-muted)]" />}
                  <input
                    type="text"
                    value={searchQ}
                    onChange={(e) => setSearchQ(e.target.value)}
                    placeholder="Buscar título…"
                    className="bg-transparent flex-1 text-sm text-white outline-none placeholder:text-[var(--text-muted)] font-bold"
                  />
                  {searchQ && <button onClick={() => setSearchQ('')} className="text-[var(--text-muted)] hover:text-white"><X size={13} /></button>}
                </div>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: '380px' }}>
                {searchResults.length === 0 && !searching && (
                  <div className="flex flex-col items-center justify-center py-10 text-[var(--text-muted)]">
                    <Film size={28} className="mb-2 opacity-40" />
                    <p className="text-xs font-bold">{searchQ ? 'Sin resultados' : 'Escribí para buscar'}</p>
                  </div>
                )}
                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => addItem(item)}
                    disabled={config.manualItems.length >= 15}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors text-left border-b disabled:opacity-40"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  >
                    <div className="w-9 h-12 rounded-[6px] overflow-hidden flex-shrink-0 bg-white/5">
                      {item.posterUrl ? <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Film size={14} className="text-[var(--text-muted)]" /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-white truncate">{item.title}</p>
                      <p className="text-xs text-[var(--text-muted)]">{typeLabel(item.type)}{item.releaseYear ? ` · ${item.releaseYear}` : ''}</p>
                    </div>
                    <div className="text-xs font-black px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: 'rgba(59,130,246,0.15)', color: '#3B82F6' }}>+ Agregar</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected items */}
            <div className="rounded-[18px] border overflow-hidden" style={{ background: 'var(--bg-card)', borderColor: 'var(--border-subtle)' }}>
              <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
                <span className="text-xs font-black text-white uppercase tracking-widest">Hero — orden de aparición</span>
                <span className="text-[10px] text-[var(--text-muted)] font-bold">Arrastrá para reordenar</span>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: '380px' }}>
                {config.manualItems.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-10 text-[var(--text-muted)]">
                    <Layers size={28} className="mb-2 opacity-40" />
                    <p className="text-xs font-bold">Agregá títulos desde la búsqueda</p>
                  </div>
                )}
                {config.manualItems.map((item, idx) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragEnter={() => handleDragEnter(idx)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                    className="flex items-center gap-3 px-3 py-2.5 border-b cursor-grab active:cursor-grabbing hover:bg-white/5 transition-colors group"
                    style={{ borderColor: 'var(--border-subtle)' }}
                  >
                    <GripVertical size={14} className="text-[var(--text-muted)] flex-shrink-0 group-hover:text-white/50" />
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0" style={{ background: 'rgba(59,130,246,0.2)', color: '#3B82F6' }}>{idx + 1}</div>
                    <div className="w-9 h-12 rounded-[6px] overflow-hidden flex-shrink-0 bg-white/5">
                      {item.posterUrl ? <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Film size={14} className="text-[var(--text-muted)]" /></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-white truncate">{item.title}</p>
                      <p className="text-xs text-[var(--text-muted)]">{typeLabel(item.type)}{item.releaseYear ? ` · ${item.releaseYear}` : ''}</p>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="p-1.5 rounded-[6px] text-[var(--text-muted)] hover:text-red-400 hover:bg-red-400/10 transition-colors flex-shrink-0">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Info card */}
      <div className="p-4 rounded-[14px] border flex items-start gap-3" style={{ background: `${activeMode.color}10`, borderColor: `${activeMode.color}30` }}>
        <div className="w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${activeMode.color}25`, color: activeMode.color }}>
          {activeMode.icon}
        </div>
        <div>
          <p className="text-sm font-black text-white">
            Modo activo: <span style={{ color: activeMode.color }}>{activeMode.label}</span>
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">
            {activeMode.description}
            {config.heroMode !== 'manual' && <span> Se mostrarán <strong style={{ color: activeMode.color }}>{config.heroLimit}</strong> ítems en el carrusel.</span>}
            {config.heroMode === 'manual' && config.manualItems.length > 0 && <span> <strong style={{ color: activeMode.color }}>{config.manualItems.length}</strong> ítems seleccionados.</span>}
          </p>
        </div>
      </div>
    </div>
  );
}
