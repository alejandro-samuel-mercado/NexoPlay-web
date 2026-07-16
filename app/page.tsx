'use client';

import { useEffect, useState } from 'react';
import PublicLayout from '@/components/layout/PublicLayout';
import SeriviaHero from '@/components/catalog/SeriviaHero';
import SeriviaFilters from '@/components/catalog/SeriviaFilters';
import { API_ROUTES } from '@/lib/api-routes';
import { useAuth } from '@/context/AuthContext';
import { MOCK_FILMS, MOCK_GENRES } from '@/lib/mockData';

export default function HomePage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
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
                        setGenres(gJson.data);
                    } else {
                        setGenres(MOCK_GENRES);
                    }
                } catch {
                    setGenres(MOCK_GENRES);
                }

                // Fetch Homepage Data
                try {
                    const hRes = await fetch(API_ROUTES.HOMEPAGE.DATA, { cache: 'no-store' });
                    const hJson = await hRes.json();
                    if (hJson.success && hJson.data) {
                        setData(hJson.data);
                    } else {
                        setData({ trending: MOCK_FILMS });
                    }
                } catch {
                    setData({ trending: MOCK_FILMS });
                }
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [user]);

    // Handle filtering
    const [filteredContent, setFilteredContent] = useState<any[]>([]);
    const [sections, setSections] = useState<{title: string, items: any[]}[]>([]);
    
    useEffect(() => {
            if (!data) return;

            // Combine backend arrays for a single pool if not filtering
            const allItems = [
                ...(data.trending || []),
                ...(data.recent || []),
                ...(data.popular || []),
                ...(data.action || [])
            ];

            const pool = allItems.length > 0 ? allItems : MOCK_FILMS;

            if (activeGenreId) {
                const filtered = pool.filter((item: any) => 
                    item.genres?.some((g: any) => g.genreId === activeGenreId || g.genre?.id === activeGenreId)
                );
                setFilteredContent(filtered.length > 0 ? filtered : MOCK_FILMS);
            } else {
                setFilteredContent(pool);
            }
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

    const heroContent = data?.recent?.[0] || MOCK_FILMS[0];

    return (
        <PublicLayout>
            <div className="page-container">
                {/* 1. Hero Card */}
                <SeriviaHero content={heroContent} contentList={data?.recent?.length > 0 ? data.recent : MOCK_FILMS} />

                {/* 2. Category Filter Pills */}
                <SeriviaFilters 
                    genres={genres} 
                    activeGenreId={activeGenreId} 
                    onSelectGenre={setActiveGenreId} 
                />

                {/* 3. Main Content Row (Single Row as in design) */}
                <div className="serivia-row-container -mt-4">
                    <div className="serivia-row-track pb-12 overflow-x-auto hide-scrollbar flex gap-4 pr-8">
                        {filteredContent.map((item, idx) => {
                            const title = item.translations?.[0]?.title || item.title || item.slug;
                            const posterUrl = item.thumbnails?.find((t: any) => t.type === 'POSTER')?.url;
                            const resolvedImage = posterUrl 
                                ? (posterUrl.startsWith('http') ? posterUrl : `https://api-streamflex.unixxtech.online/api/${posterUrl.replace(/^\//, '')}`)
                                : 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=600';

                            return (
                                <a href={`/contenido/${item.slug}`} key={item.id || idx} className="block group flex-shrink-0 w-[160px]" style={{ textDecoration: 'none' }}>
                                    <div className="serivia-poster overflow-hidden rounded-[16px] mb-3 shadow-[0_8px_20px_rgba(0,0,0,0.4)]">
                                        <img 
                                            src={resolvedImage} 
                                            alt={title} 
                                            className="w-full aspect-[2/3] object-cover transition-transform duration-500 group-hover:scale-110" 
                                        />
                                    </div>
                                    <div className="serivia-poster-info px-1">
                                        <h3 className="text-white font-bold text-[0.95rem] mb-1 truncate">{title}</h3>
                                        <div className="flex items-center text-[0.8rem] text-gray-400 gap-2">
                                            <span>{item.releaseYear || '2024'}</span>
                                            <span>•</span>
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
            </div>
        </PublicLayout>
    );
}
