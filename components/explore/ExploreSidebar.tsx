'use client';

import { CONTENT_TYPES_LIST, getContentTypeLabel } from '@/lib/content-types';

interface ExploreSidebarProps {
    onFilterChange: (filters: any) => void;
    activeFilters: any;
    genres: any[];
    platforms: any[];
    tags?: any[];
}

export default function ExploreSidebar({ onFilterChange, activeFilters, genres, platforms, tags }: ExploreSidebarProps) {
    const types = CONTENT_TYPES_LIST.map(id => ({
        id,
        name: getContentTypeLabel(id)
    }));

    const quickFilters = [
        { id: 'recommended', name: 'Recomendados' },
        { id: 'latest', name: 'Últimos subidos' },
        { id: 'premieres', name: 'Estrenos' },
    ];

    const updateFilter = (key: string, value: any) => {
        onFilterChange({ ...activeFilters, [key]: value, page: 1 });
    };

    return (
        <div className="w-full flex flex-col gap-4 mb-2">
            <div className="flex flex-wrap items-center gap-3">
                {/* Type */}
                <select 
                    className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] text-[var(--text-main)] text-sm font-medium rounded-xl px-4 py-2.5 shadow-inner outline-none focus:border-[var(--border-strong)] transition-all cursor-pointer" 
                    value={activeFilters.type || ''} 
                    onChange={(e) => updateFilter('type', e.target.value || null)}
                >
                    <option value="">Tipo: Todos</option>
                    {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>

                {/* Genre */}
                <select 
                    className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] text-[var(--text-main)] text-sm font-medium rounded-xl px-4 py-2.5 shadow-inner outline-none focus:border-[var(--border-strong)] transition-all cursor-pointer" 
                    value={activeFilters.genreId || ''} 
                    onChange={(e) => updateFilter('genreId', e.target.value || null)}
                >
                    <option value="">Género: Todos</option>
                    {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>

                {/* Platform */}
                <select 
                    className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] text-[var(--text-main)] text-sm font-medium rounded-xl px-4 py-2.5 shadow-inner outline-none focus:border-[var(--border-strong)] transition-all cursor-pointer" 
                    value={activeFilters.platformId || ''} 
                    onChange={(e) => updateFilter('platformId', e.target.value || null)}
                >
                    <option value="">Plataforma: Todas</option>
                    {platforms.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>

                {/* Quick Filters */}
                <select 
                    className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] text-[var(--text-main)] text-sm font-medium rounded-xl px-4 py-2.5 shadow-inner outline-none focus:border-[var(--border-strong)] transition-all cursor-pointer" 
                    value={activeFilters.quick || ''} 
                    onChange={(e) => updateFilter('quick', e.target.value || null)}
                >
                    <option value="">Descubrir: Todo</option>
                    {quickFilters.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
            </div>

            {/* Tags Horizontal Scroll */}
            {tags && tags.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2">
                    {tags.map(t => (
                        <button
                            key={t.id}
                            onClick={() => updateFilter('tagId', activeFilters.tagId === t.id ? null : t.id)}
                            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${activeFilters.tagId === t.id
                                    ? 'bg-[var(--color-primary)] text-black border-transparent shadow-md'
                                    : 'bg-[var(--bg-panel)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:border-[var(--border-strong)] hover:text-[var(--text-main)]'
                                }`}
                        >
                            #{t.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
