'use client';

import SyncButton from '@/components/admin/SyncButton';
import { API, apiFetch } from '@/lib/api';
import { API_ROUTES, resolveImageUrl } from '@/lib/api-routes';
import { getContentTypeLabel } from '@/lib/content-types';
import { BarChart2, Calendar, ChevronLeft, ChevronRight, CloudDownload, Download, Eye, EyeOff, Film, Hash, Loader2, Search, SortAsc, SortDesc } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

interface ContentItem {
    id: string;
    type: string;
    status: string;
    viewCount: string;
    downloadCount: string;
    rating: number | null;
    createdAt: string;
    slug: string;
    title: string;
    originalTitle?: string | null;
    platform?: { name: string; logoUrl?: string };
    genres?: { genre: { name: string } }[];
    thumbnails?: { type: string; url: string }[];
    posterUrl?: string;
    
    // NexoPlay extensions
    isVisible: boolean;
    isDownloadable: boolean;
    price: number;
    codesCount: number;
    seasonsCount: number;
}

const STATUS_CLASS: Record<string, string> = {
    ACTIVE: 'adm-badge adm-badge--green',
    READY: 'adm-badge adm-badge--green',
    PENDING: 'adm-badge adm-badge--yellow',
    PROCESSING: 'adm-badge adm-badge--blue',
    ERROR: 'adm-badge adm-badge--red',
};

// Types from schema update
const CONTENT_TYPES = [
    'MOVIE', 'SERIES', 'ANIME', 'ANIMATION', 'DOCUMENTARY',
    'BIOGRAPHY', 'REALITY_SHOW', 'TALK_SHOW', 'VARIETY_SHOW',
    'STAND_UP', 'SPECIAL', 'EDUCATIONAL', 'KIDS', 'FAMILY',
    'INTERACTIVE', 'EXPERIMENTAL', 'DOCUDRAMA', 'NOVELA'
];

export default function AdminContentPage() {
    // States for filters
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterPlatform, setFilterPlatform] = useState('');
    const [filterGenre, setFilterGenre] = useState('');
    const [filterVisibility, setFilterVisibility] = useState('');
    const [sort, setSort] = useState('recent');

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 30;

    // Selection State
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [bulkAction, setBulkAction] = useState<string>('');

    useEffect(() => {
        const saved = sessionStorage.getItem('admin_content_selected');
        if (saved) {
            try { setSelectedIds(JSON.parse(saved)); } catch (e) {}
        }
    }, []);

    useEffect(() => {
        sessionStorage.setItem('admin_content_selected', JSON.stringify(selectedIds));
    }, [selectedIds]);

    // Data
    const [contents, setContents] = useState<ContentItem[]>([]);
    const [platforms, setPlatforms] = useState<any[]>([]);
    const [genres, setGenres] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMetadata = useCallback(async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const headers = { ...(token ? { 'Authorization': `Bearer ${token}` } : {}) };

            const [pRes, gRes] = await Promise.all([
                fetch('https://api-streamflex.unixxtech.online/api/platforms'),
                fetch('https://api-streamflex.unixxtech.online/api/categories/genres')
            ]);

            const [pData, gData] = await Promise.all([pRes.json(), gRes.json()]);

            setPlatforms(pData.data || []);
            setGenres(gData.data || []);
        } catch (err) {
            console.error('Error fetching metadata:', err);
        }
    }, []);

    const fetchContents = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                sort,
            });

            if (debouncedSearch) params.append('search', debouncedSearch);
            if (filterType) params.append('type', filterType);
            if (filterPlatform) params.append('platformId', filterPlatform);
            if (filterGenre) params.append('genreId', filterGenre);
            if (filterVisibility) params.append('visibility', filterVisibility);

            const res = await apiFetch(`${API.ADMIN.CONTENT}?${params}`);
            
            if (res.success) {
                setContents(res.data ?? []);
                setTotalItems(res.meta?.total || res.pagination?.total || 0);
                setTotalPages(res.meta?.totalPages || res.pagination?.totalPages || 1);
            }
        } catch (err: any) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, [page, sort, filterType, filterPlatform, filterVisibility, filterGenre, debouncedSearch]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            if (search !== debouncedSearch) setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search, debouncedSearch]);

    useEffect(() => { fetchMetadata(); }, [fetchMetadata]);
    useEffect(() => { fetchContents(); }, [fetchContents]);

    const toggleVisibility = async (id: string, current: boolean) => {
        await apiFetch(API.ADMIN.CONTENT_VISIBILITY(id), {
          method: 'PATCH',
          body: JSON.stringify({ isVisible: !current }),
        });
        setContents(prev => prev.map(c => c.id === id ? { ...c, isVisible: !current } : c));
    };

    const toggleDownloadable = async (id: string, current: boolean) => {
        await apiFetch(API.ADMIN.CONTENT_VISIBILITY(id), {
          method: 'PATCH',
          body: JSON.stringify({ isDownloadable: !current }),
        });
        setContents(prev => prev.map(c => c.id === id ? { ...c, isDownloadable: !current } : c));
    };

    const updatePrice = async (id: string, price: number) => {
        await apiFetch(API.ADMIN.CONTENT_VISIBILITY(id), {
          method: 'PATCH',
          body: JSON.stringify({ price }),
        });
    };

    const handlePriceChange = (id: string, val: string) => {
        setContents((prev) => prev.map(item => item.id === id ? { ...item, price: parseFloat(val) || 0 } : item));
    };

    const promptPriceChange = (id: string, currentPrice: number) => {
        const val = window.prompt("Ingrese el nuevo precio para este contenido:", currentPrice.toString());
        if (val !== null) {
            const parsed = parseFloat(val);
            if (!isNaN(parsed)) {
                handlePriceChange(id, val);
                updatePrice(id, parsed);
            }
        }
    }

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const newIds = contents.map(c => c.id);
            setSelectedIds(prev => Array.from(new Set([...prev, ...newIds])));
        } else {
            const pageIds = contents.map(c => c.id);
            setSelectedIds(prev => prev.filter(id => !pageIds.includes(id)));
        }
    };

    const toggleSelection = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleBulkAction = async () => {
        const action = bulkAction;
        if (!action) return;

        const messages: Record<string, string> = {
            hide: '¿Estás seguro de ocultar del catálogo los contenidos seleccionados?',
            show: '¿Estás seguro de hacer visibles los contenidos seleccionados?',
            disable_download: '¿Estás seguro de deshabilitar la descarga para los contenidos seleccionados?',
            enable_download: '¿Estás seguro de habilitar la descarga para los contenidos seleccionados?',
        };

        const confirmMsg = messages[action];
        if (!confirmMsg || !window.confirm(confirmMsg)) return;

        try {
            for (const id of selectedIds) {
                if (action === 'hide') await toggleVisibility(id, true);
                if (action === 'show') await toggleVisibility(id, false);
                if (action === 'disable_download') await toggleDownloadable(id, true);
                if (action === 'enable_download') await toggleDownloadable(id, false);
            }
            setSelectedIds([]);
            setBulkAction('');
        } catch (err) {
            console.error(err);
            alert('Error de conexión');
        }
    };

    const isAllSelected = contents.length > 0 && contents.every(c => selectedIds.includes(c.id));

    const toggleSort = () => {
        if (sort === 'az') setSort('za');
        else if (sort === 'za') setSort('recent');
        else setSort('az');
        setPage(1);
    };

    return (
        <div className="adm-page p-10">
            <div className="adm-page-header">
                <div>
                    <h1 className="adm-page-title">Inventario de Contenido</h1>
                    <p className="adm-page-subtitle">Gestiona {totalItems} títulos en tu catálogo (precios, visibilidad y descargas)</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <SyncButton />
                </div>
            </div>

            {/* Quick Filters - Type Buttons */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 8 }} className="no-scrollbar">
                <button
                    className={`adm-btn adm-btn--sm ${filterType === '' ? 'adm-btn--primary' : 'adm-btn--ghost'}`}
                    onClick={() => { setFilterType(''); setPage(1); }}
                >
                    Todos
                </button>
                {CONTENT_TYPES.slice(0, 8).map(t => (
                    <button
                        key={t}
                        className={`adm-btn adm-btn--sm ${filterType === t ? 'adm-btn--primary' : 'adm-btn--ghost'}`}
                        onClick={() => { setFilterType(t); setPage(1); }}
                    >
                        {getContentTypeLabel(t)}
                    </button>
                ))}
                {CONTENT_TYPES.length > 8 && (
                    <select
                        className="adm-select adm-select--sm"
                        style={{ width: 'auto' }}
                        value={CONTENT_TYPES.includes(filterType) && CONTENT_TYPES.indexOf(filterType) >= 8 ? filterType : ''}
                        onChange={e => { setFilterType(e.target.value); setPage(1); }}
                    >
                        <option value="">Más tipos...</option>
                        {CONTENT_TYPES.slice(8).map(t => <option key={t} value={t}>{getContentTypeLabel(t)}</option>)}
                    </select>
                )}
            </div>

            {/* Advanced Filters Toolbar */}
            <div className="adm-toolbar" style={{ display: 'flex', gap: 20 }}>
                <div className="adm-search-wrap" style={{ maxWidth: "500px" }}>
                    <Search size={15} className="adm-search-icon" />
                    <input
                        type="text" placeholder="Buscar por título..."
                        value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                        className="adm-search-input"
                    />
                </div>

                <select
                    className="adm-select"
                    value={filterPlatform}
                    onChange={e => { setFilterPlatform(e.target.value); setPage(1); }}
                    style={{ maxWidth: 120 }}>
                    <option value="">Plataformas</option>
                    {platforms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>

                <select
                    className="adm-select"
                    value={filterGenre} style={{ maxWidth: 120 }}
                    onChange={e => { setFilterGenre(e.target.value); setPage(1); }}
                >
                    <option value="">Categorías</option>
                    {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>

                <select
                    className="adm-select"
                    value={filterVisibility}
                    style={{ maxWidth: 140 }}
                    onChange={e => { setFilterVisibility(e.target.value); setPage(1); }}
                >
                    <option value="">Toda la Visibilidad</option>
                    <option value="visible">Públicos (Visibles)</option>
                    <option value="hidden">Ocultos</option>
                </select>

                <button
                    className="adm-btn adm-btn--ghost"
                    title="Ordenar alfabéticamente"
                    onClick={toggleSort}
                    style={{ maxWidth: 120 }}
                >
                    {sort === 'az' ? <SortAsc size={16} /> : <SortDesc size={16} />}
                    {sort === 'az' ? ' A-Z' : ' Recientes'}
                </button>
            </div>

            {selectedIds.length > 0 && (
                <div className="adm-toolbar" style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                    <span style={{ fontWeight: 600, color: '#60a5fa', marginRight: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Hash size={14} />
                        {selectedIds.length} elemento{selectedIds.length !== 1 ? 's' : ''} seleccionado{selectedIds.length !== 1 ? 's' : ''}
                    </span>
                    
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center', background: 'rgba(255, 215, 0, 0.1)', padding: '2px 4px 2px 8px', borderRadius: 6, border: '1px solid rgba(255, 215, 0, 0.2)' }}>
                        <select 
                            className="adm-select adm-select--sm" 
                            value={bulkAction} 
                            onChange={e => setBulkAction(e.target.value)} 
                            style={{ padding: '4px 24px 4px 8px', border: 'none', background: 'transparent', color: '#FFD700' }}
                        >
                            <option value="">Acción masiva...</option>
                            <option value="hide">Ocultar del catálogo</option>
                            <option value="show">Hacer visibles</option>
                            <option value="disable_download">Deshabilitar descargas</option>
                            <option value="enable_download">Habilitar descargas</option>
                        </select>
                        <button 
                            className="adm-btn adm-btn--sm adm-btn--ghost" 
                            onClick={() => bulkAction ? handleBulkAction() : alert('Selecciona una acción primero')} 
                            style={{ color: '#FFD700' }}
                        >
                            Aplicar
                        </button>
                    </div>

                    <button className="adm-btn adm-btn--sm" onClick={() => setSelectedIds([])} style={{ marginLeft: 8 }}>
                        Cancelar
                    </button>
                </div>
            )}

            <div className="adm-table-card">
                <div className="adm-table-wrapper">
                    <table className="adm-table">
                    <thead>
                        <tr>
                            <th style={{ width: 40, textAlign: 'center' }}>
                                <input type="checkbox" checked={isAllSelected} onChange={handleSelectAll} style={{ cursor: 'pointer' }} />
                            </th>
                            <th style={{ width: 60 }}>Poster</th>
                            <th>Título / Slug</th>
                            <th>Información</th>
                            <th>Métricas</th>
                            <th>Categoría/Géneros</th>
                            <th style={{ textAlign: 'right' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} style={{ textAlign: 'center', padding: '60px' }}>
                                <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto', color: 'var(--adm-primary)' }} />
                            </td></tr>
                        ) : contents.length === 0 ? (
                            <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--adm-muted)' }}>No se encontró contenido con los filtros aplicados.</td></tr>
                        ) : contents.map(item => {
                            const poster = item.posterUrl;
                            const isSeries = item.type === 'SERIES' || item.type === 'ANIME' || item.type === 'NOVELA';

                            return (
                                <tr key={item.id} style={{ background: selectedIds.includes(item.id) ? 'rgba(59, 130, 246, 0.05)' : '' }}>
                                    <td style={{ textAlign: 'center' }}>
                                        <input type="checkbox" checked={selectedIds.includes(item.id)} onChange={() => toggleSelection(item.id)} style={{ cursor: 'pointer' }} />
                                    </td>
                                    <td>
                                        <div style={{ width: 40, height: 56, borderRadius: 6, overflow: 'hidden', background: 'var(--adm-bg-alt)' }}>
                                            {poster ? <img src={resolveImageUrl(poster)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Film size={16} style={{ margin: '20px auto', display: 'block', opacity: 0.2 }} />}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <Link href={`/film/${item.slug}`} style={{ fontWeight: 600, color: 'white', fontSize: '0.95rem' }} className="hover:text-[var(--color-primary)] transition-colors">
                                                {item.title}
                                            </Link>
                                            <code style={{ fontSize: '0.7rem', color: 'var(--adm-muted)', marginTop: 2 }}>{item.slug || 'sin-slug'}</code>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                                <span className="adm-badge adm-badge--gray" style={{ fontSize: '0.65rem' }}>{getContentTypeLabel(item.type)}</span>
                                                {item.platform && (
                                                    <span className="adm-badge" style={{ fontSize: '0.65rem', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa' }}>
                                                        {item.platform.logoUrl && <img src={item.platform.logoUrl} alt="" style={{ width: 12, height: 12, objectFit: 'contain', display: 'inline-block', marginRight: 4 }} />}
                                                        {item.platform.name}
                                                    </span>
                                                )}
                                                {isSeries && (
                                                    <span className="adm-badge" style={{ fontSize: '0.65rem', background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899' }}>
                                                        {item.seasonsCount} Temp.
                                                    </span>
                                                )}
                                            </div>
                                            {item.createdAt && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--adm-muted)', fontSize: '0.75rem', marginTop: 2 }}>
                                                    <Calendar size={12} /> {new Date(item.createdAt).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                            <div title="Visualizaciones (Flex)" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--adm-primary)', fontSize: '0.85rem', fontWeight: 600 }}>
                                                <BarChart2 size={14} /> {Number(item.viewCount).toLocaleString()} visitas
                                            </div>
                                            <div title="Descargas (Flex)" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#facc15', fontSize: '0.85rem' }}>
                                                <CloudDownload size={14} /> {Number(item.downloadCount).toLocaleString()} descargas
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                            {item.genres && item.genres.length > 0 && (
                                                <div style={{ fontSize: '0.75rem', color: 'var(--adm-text)', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                                    {item.genres.map(g => (
                                                        <span key={g.genre.name} style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 4 }}>
                                                            {g.genre.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                                            
                                            {/* Price Button */}
                                            <button 
                                                onClick={() => promptPriceChange(item.id, item.price)}
                                                className="adm-btn adm-btn--sm adm-btn--ghost"
                                                style={{ color: item.price > 0 ? '#10b981' : 'var(--adm-muted)' }}
                                                title={`Cambiar Precio (Actual: $${item.price})`}
                                            >
                                                ${item.price}
                                            </button>

                                            {/* Visibility Toggle */}
                                            <button onClick={() => toggleVisibility(item.id, item.isVisible)}
                                                className={`adm-btn adm-btn--sm ${item.isVisible ? 'adm-btn--ghost' : ''}`}
                                                style={{ 
                                                    padding: '6px',
                                                    ...(item.isVisible ? { color: '#10b981', borderColor: 'rgba(16,185,129,0.3)' } : { color: '#ef4444', background: 'rgba(239,68,68,0.1)' })
                                                }}
                                                title={item.isVisible ? 'Público (Click para ocultar)' : 'Oculto (Click para publicar)'}>
                                                {item.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                                            </button>
                                            
                                            {/* Download Toggle */}
                                            <button onClick={() => toggleDownloadable(item.id, item.isDownloadable)}
                                                className={`adm-btn adm-btn--sm ${item.isDownloadable ? 'adm-btn--ghost' : ''}`}
                                                style={{ 
                                                    padding: '6px',
                                                    ...(item.isDownloadable ? { color: 'var(--adm-primary)', borderColor: 'var(--adm-primary-alpha)' } : { color: 'var(--adm-muted)' })
                                                }}
                                                title={item.isDownloadable ? 'Descargas activas' : 'Descargas bloqueadas'}>
                                                <Download size={16} />
                                            </button>

                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--adm-muted)' }}>
                            Página <strong style={{ color: 'white' }}>{page}</strong> de <strong style={{ color: 'white' }}>{totalPages}</strong>
                        </span>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button className="adm-btn adm-btn--sm adm-btn--ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ padding: '6px 12px' }}>
                                <ChevronLeft size={16} /> Anterior
                            </button>
                            <button className="adm-btn adm-btn--sm adm-btn--ghost" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: '6px 12px' }}>
                                Siguiente <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
