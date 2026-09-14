'use client';

import { useEffect, useState } from 'react';
import PublicLayout from '@/components/layout/PublicLayout';
import SeriviaHero from '@/components/catalog/SeriviaHero';
import SeriviaFilters from '@/components/catalog/SeriviaFilters';
import { API_ROUTES, resolveImageUrl } from '@/lib/api-routes';
import { useAuth } from '@/context/AuthContext';
import { MOCK_FILMS, MOCK_GENRES } from '@/lib/mockData';

export default function HomePage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [heroItems, setHeroItems] = useState<any[]>([]);
    const [genres, setGenres] = useState<any[]>(MOCK_GENRES);
    const [activeGenreId, setActiveGenreId] = useState<string | null>(null);

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                // Fetch Genres
                try {
                    const gRes = await fetch(API_ROUTES.CATEGORIES.GENRES);
                    const gJson = await gRes.json();
                    if (gJson.success && gJson.data?.length > 0) {
                        const uniqueGenres = gJson.data.filter((v: any, i: number, a: any[]) => a.findIndex(t => (t.name === v.name)) === i);
                        setGenres(uniqueGenres.length > 0 ? uniqueGenres : MOCK_GENRES);
                    } else {
                        setGenres(MOCK_GENRES);
                    }
                } catch {
                    setGenres(MOCK_GENRES);
                }

                // Fetch Homepage Data — includes heroItems pre-built by backend
                try {
                    const hRes = await fetch(API_ROUTES.HOMEPAGE.DATA, { cache: 'no-store' });
                    const hJson = await hRes.json();
                    if (hJson.success && hJson.data) {
                        setData(hJson.data);
                        // Use heroItems from API (driven by admin-configured hero_mode)
                        if (hJson.data.heroItems?.length > 0) {
                            setHeroItems(hJson.data.heroItems);
                        } else {
                            // Fallback: build from trending/recent
                            const pool = [
                                ...(hJson.data.recent || []),
                                ...(hJson.data.trending || []),
                            ];
                            const unique = Array.from(new Map(pool.map((item: any) => [item.id, item])).values());
                            setHeroItems(unique.slice(0, 10).length > 0 ? unique.slice(0, 10) : MOCK_FILMS);
                        }
                    } else {
                        setData({ trending: MOCK_FILMS });
                        setHeroItems(MOCK_FILMS);
                    }
                } catch {
                    setData({ trending: MOCK_FILMS });
                    setHeroItems(MOCK_FILMS);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [user?.id]);

    const [filteredContent, setFilteredContent] = useState<any[]>([]);
    const [isFiltering, setIsFiltering] = useState(false);
    
    useEffect(() => {
            if (!data) return;

            const allItems = [
                ...(data.trending || []),
                ...(data.recent || []),
                ...(data.popular || []),
                ...(data.action || [])
            ];

            const pool = allItems.length > 0 ? allItems : MOCK_FILMS;

            if (!activeGenreId) {
                setFilteredContent(pool);
                return;
            }

            const fetchGenreData = async () => {
                setIsFiltering(true);
                try {
                    const res = await fetch(`${API_ROUTES.CONTENT.LIST}?genreId=${activeGenreId}&limit=15`);
                    const json = await res.json();
                    if (json.success && json.data?.length > 0) {
                        setFilteredContent(json.data);
                    } else {
                        const localFiltered = pool.filter((item: any) => 
                            item.genres?.some((g: any) => g.genreId === activeGenreId || g.genre?.id === activeGenreId)
                        );
                        setFilteredContent(localFiltered); 
                    }
                } catch (error) {
                    console.error("Error fetching genre data:", error);
                    const localFiltered = pool.filter((item: any) => 
                        item.genres?.some((g: any) => g.genreId === activeGenreId || g.genre?.id === activeGenreId)
                    );
                    setFilteredContent(localFiltered);
                } finally {
                    setIsFiltering(false);
                }
            };
            
            fetchGenreData();
    }, [data, activeGenreId]);

    if (loading) {
        return (
            <PublicLayout>
                <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyItems: 'center', width: '100%', height: '100%' }}>
                    <div className="adm-spin w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full mx-auto" />
                </div>
            </PublicLayout>
        );
    }

    // Exclude heroItems from content rows to avoid duplicates
    const heroIds = new Set(heroItems.map((h: any) => h.id));
    const heroContent = heroItems[0];
    const filteredTrending = (data?.trending || []).filter((item: any) => !heroIds.has(item.id));
    const filteredRecent = (data?.recent || []).filter((item: any) => !heroIds.has(item.id));

    return (
        <PublicLayout>
            <div className="page-container">
                {/* 1. Hero Card — content driven by admin hero_mode config */}
                <SeriviaHero content={heroContent} contentList={heroItems} />

                {/* 2. Category Filter Pills */}
                <SeriviaFilters 
                    genres={genres} 
                    activeGenreId={activeGenreId} 
                    onSelectGenre={setActiveGenreId} 
                />

                {/* 3. Main Content Rows */}
                <div className="serivia-row-container -mt-4">
                    {isFiltering ? (
                        <div className="flex justify-center items-center py-20 w-full">
                            <div className="w-8 h-8 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin"></div>
                        </div>
                    ) : (
                        <>
                            {activeGenreId ? (
                                <>
                                    {filteredContent.length === 0 ? (
                                        <div className="flex justify-center items-center py-20 w-full text-[var(--text-muted)] text-sm">
                                            No hay contenido disponible para este género.
                                        </div>
                                    ) : (
                                        <ContentRow title="Resultados Filtrados" items={filteredContent} />
                                    )}
                                </>
                            ) : (
                                <>
                                    {filteredTrending && filteredTrending.length > 0 && (
                                        <ContentRow title="Tendencias" items={filteredTrending} />
                                    )}
                                    {filteredRecent && filteredRecent.length > 0 && (
                                        <div className={filteredTrending && filteredTrending.length > 0 ? "mt-8" : ""}>
                                            <ContentRow title="Agregados Recientemente" items={filteredRecent} />
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}

function ContentRow({ title, items }: { title: string; items: any[] }) {
    return (
        <div className="mb-8">
            <h2 className="text-white text-xl font-bold mb-4 pl-1">{title}</h2>
            <div className="serivia-row-track pb-4 overflow-x-auto hide-scrollbar flex gap-4 pr-8">
                {items.map((item, idx) => {
                    const itemTitle = item.title || item.translations?.[0]?.title || item.slug;
                    const posterUrl = item.posterUrl || item.thumbnails?.find((t: any) => t.type === 'POSTER')?.url;
                    const resolvedImage = posterUrl 
                        ? resolveImageUrl(posterUrl)
                        : 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=600';

                    return (
                        <a href={`/film/${item.slug}`} key={item.id || idx} className="block group flex-shrink-0 w-[160px]" style={{ textDecoration: 'none' }}>
                            <div className="serivia-poster overflow-hidden rounded-[16px] mb-3 shadow-[0_8px_20px_rgba(0,0,0,0.4)]">
                                <img 
                                    src={resolvedImage} 
                                    alt={itemTitle} 
                                    className="w-full aspect-[2/3] object-cover transition-transform duration-500 group-hover:scale-110" 
                                />
                            </div>
                            <div className="serivia-poster-info px-1">
                                <h3 className="text-white font-bold text-[0.95rem] mb-1 truncate">{itemTitle}</h3>
                                <div className="flex items-center text-[0.8rem] text-gray-400 gap-2">
                                    <span>{item.releaseYear || '2024'}</span>
                                    <span>•</span>
                                    <span className="truncate">{item.genres?.[0]?.name || item.genres?.[0]?.genre?.name || 'Película'}</span>
                                    <span className="flex items-center text-[#FFD700] font-bold">
                                        ★ {item.rating ? item.rating.toFixed(1) : '8.5'}
                                    </span>
                                </div>
                            </div>
                        </a>
                    );
                })}
            </div>
        </div>
    );
}
