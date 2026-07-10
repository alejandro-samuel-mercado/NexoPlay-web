'use client';

import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Filter, SlidersHorizontal, X } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import ContentCard from '@/components/content/ContentCard';
import { API } from '@/lib/api';
import PublicLayout from '@/components/layout/PublicLayout';

const TYPES = [
  { value: '', label: 'Todo el catálogo' },
  { value: 'MOVIE', label: '🎬 Películas' },
  { value: 'SERIES', label: '📺 Series' },
  { value: 'ANIME', label: '⚡ Anime' },
  { value: 'DOCUMENTARY', label: '🎙️ Documentales' },
  { value: 'NOVELA', label: '💫 Novelas' },
  { value: 'ANIMATION', label: '🎨 Animación' },
  { value: 'BIOGRAPHY', label: '📖 Biografías' },
];

const SORTS = [
  { value: 'recent', label: 'Más recientes' },
  { value: 'popular', label: 'Más populares' },
  { value: 'rating', label: 'Mejor puntuados' },
  { value: 'releaseYear', label: 'Año de estreno' },
  { value: 'az', label: 'A → Z' },
  { value: 'za', label: 'Z → A' },
];

interface Genre { id: string; name: string; slug: string; }

function ExplorarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [items, setItems] = useState<any[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);
  
  // page state is now internal for infinite scroll, not from URL
  const [page, setPage] = useState(1);
  const type = searchParams.get('type') || '';
  const sort = searchParams.get('sort') || 'recent';
  const genreId = searchParams.get('genreId') || '';
  const minYear = searchParams.get('minYear') || '';
  const maxYear = searchParams.get('maxYear') || '';
  const LIMIT = 24;

  const fetchContent = useCallback(async (pageNum = 1, shouldAppend = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const params = new URLSearchParams({
        page: String(pageNum), limit: String(LIMIT), sort, lang: 'es',
        ...(type ? { type } : {}),
        ...(genreId ? { genreId } : {}),
        ...(minYear ? { minYear } : {}),
        ...(maxYear ? { maxYear } : {}),
      });
      const res = await fetch(`${API.CONTENT.BASE}?${params}`).then(r => r.json());
      if (res.success && res.data?.length) { 
        if (shouldAppend) setItems(prev => [...prev, ...res.data]);
        else setItems(res.data);
        
        setTotal(res.meta?.total || 0);
        setHasMore(res.data.length === LIMIT);
        setPage(pageNum);
      } else {
        if (!shouldAppend) setItems([]);
        setHasMore(false);
      }
    } catch (e) {
      console.warn('API fetch failed, loading mock data');
      const MOCK_ITEMS = [
        { id: '1', title: 'Arcane', slug: 'arcane', type: 'SERIES', releaseYear: 2021, rating: 9.1, posterUrl: 'https://image.tmdb.org/t/p/w500/AHO3Q44E41P0m34pD8I8T4Rz81f.jpg' },
        { id: '2', title: 'Blade Runner 2049', slug: 'blade-runner', type: 'MOVIE', releaseYear: 2017, rating: 8.0, posterUrl: 'https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg' },
        { id: '3', title: 'Dune', slug: 'dune', type: 'MOVIE', releaseYear: 2021, rating: 8.0, posterUrl: 'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg' },
        { id: '4', title: 'Interstellar', slug: 'interstellar', type: 'MOVIE', releaseYear: 2014, rating: 8.6, posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg' },
        { id: '5', title: 'The Batman', slug: 'the-batman', type: 'MOVIE', releaseYear: 2022, rating: 7.8, posterUrl: 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg' },
        { id: '6', title: 'Joker', slug: 'joker', type: 'MOVIE', releaseYear: 2019, rating: 8.4, posterUrl: 'https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg' },
        { id: '7', title: 'The Matrix', slug: 'the-matrix', type: 'MOVIE', releaseYear: 1999, rating: 8.7, posterUrl: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg' },
        { id: '8', title: 'Inception', slug: 'inception', type: 'MOVIE', releaseYear: 2010, rating: 8.8, posterUrl: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg' }
      ];
      setItems(MOCK_ITEMS);
      setTotal(8);
      setHasMore(false);
    }
    finally { 
      setLoading(false); 
      setLoadingMore(false);
    }
  }, [type, sort, genreId, minYear, maxYear]);

  // Reset and fetch page 1 on filter changes
  useEffect(() => { 
    fetchContent(1, false); 
  }, [fetchContent]);

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          fetchContent(page + 1, true);
        }
      },
      { threshold: 0.1, rootMargin: '400px' }
    );

    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [fetchContent, hasMore, loading, loadingMore, page]);

  useEffect(() => {
    fetch(API.CONTENT.GENRES).then(r => r.json()).then(res => {
      if (res.success && res.data?.length) setGenres(res.data);
      else throw new Error();
    }).catch(() => {
      setGenres([
        { id: '1', name: 'Movies', slug: 'movies' },
        { id: '2', name: 'Series', slug: 'series' },
        { id: '3', name: 'Anime', slug: 'anime' },
        { id: '4', name: 'Action', slug: 'action' },
        { id: '5', name: 'Sci-Fi', slug: 'sci-fi' }
      ]);
    });
  }, []);

  const setParam = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams.toString());
    if (value) p.set(key, value); else p.delete(key);
    router.push(`/explorar?${p.toString()}`);
  };

  return (
    <PublicLayout>
      <div className="pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-main)] tracking-tight">Explorar</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              {loading ? 'Cargando...' : `${total.toLocaleString()} títulos disponibles`}
            </p>
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-[var(--bg-panel)] hover:bg-[var(--bg-hover)] transition-colors border border-[var(--border-subtle)] rounded-full px-5 py-2.5 text-sm font-semibold text-[var(--text-main)]">
            <SlidersHorizontal size={15} />
            Filtros
            {(type || genreId || minYear || maxYear) && (
              <span className="w-2 h-2 rounded-full bg-red-500 ml-1"></span>
            )}
          </button>
        </div>

        {/* Type tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 hide-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
          {TYPES.map((t) => (
            <button key={t.value} onClick={() => setParam('type', t.value)}
              className={`filter-pill ${type === t.value ? 'active' : ''} shrink-0`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="bg-[var(--bg-panel)] p-6 rounded-3xl mb-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6 border border-[var(--border-subtle)] shadow-xl">
            {/* Sort */}
            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] mb-2 block uppercase tracking-wider">Ordenar por</label>
              <select value={sort} onChange={(e) => setParam('sort', e.target.value)}
                className="w-full bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border-strong)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--border-focus)] transition-colors">
                {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            {/* Genre */}
            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] mb-2 block uppercase tracking-wider">Género</label>
              <select value={genreId} onChange={(e) => setParam('genreId', e.target.value)}
                className="w-full bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border-strong)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--border-focus)] transition-colors">
                <option value="">Todos los géneros</option>
                {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            {/* Min Year */}
            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] mb-2 block uppercase tracking-wider">Año desde</label>
              <input type="number" placeholder="ej: 2000" value={minYear}
                onChange={(e) => setParam('minYear', e.target.value)}
                className="w-full bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border-strong)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--border-focus)] transition-colors placeholder:text-[var(--text-muted)]" min={1900} max={2030} />
            </div>
            {/* Max Year */}
            <div>
              <label className="text-xs font-semibold text-[var(--text-muted)] mb-2 block uppercase tracking-wider">Año hasta</label>
              <input type="number" placeholder="ej: 2025" value={maxYear}
                onChange={(e) => setParam('maxYear', e.target.value)}
                className="w-full bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border-strong)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--border-focus)] transition-colors placeholder:text-[var(--text-muted)]" min={1900} max={2030} />
            </div>

            {/* Clear */}
            <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
              <button onClick={() => { router.push('/explorar'); setShowFilters(false); }}
                className="flex items-center gap-2 bg-[var(--bg-hover)] hover:bg-[var(--bg-hover-strong)] transition-colors border border-[var(--border-subtle)] rounded-full px-5 py-2.5 text-sm font-semibold text-[var(--text-main)]">
                <X size={15} /> Limpiar filtros
              </button>
            </div>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6">
          {loading
            ? Array.from({ length: LIMIT }).map((_, i) => (
              <div key={i} className="aspect-[2/3] shimmer rounded-[16px] md:rounded-[20px]" />
            ))
            : items.map((item) => <ContentCard key={item.id} item={item} />)
          }
        </div>

        {/* Empty state */}
        {!loading && items.length === 0 && (
          <div className="text-center py-24 bg-[var(--bg-panel)]/50 rounded-3xl border border-[var(--border-subtle)] mt-8">
            <div className="text-5xl mb-6 opacity-50">🔍</div>
            <h2 className="text-2xl font-bold text-[var(--text-main)] mb-2">Sin resultados</h2>
            <p className="text-[var(--text-muted)]">Probá con otros filtros o categorías</p>
          </div>
        )}

        {/* Infinite Scroll Loader */}
        {hasMore && (
          <div ref={observerTarget} className="flex justify-center mt-12 mb-8 py-4">
            {loadingMore && <div className="clay-skeleton w-12 h-12 rounded-full animate-spin" />}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}

export default function ExplorarPage() {
  return (
    <Suspense fallback={
      <PublicLayout>
        <div className="flex-1 flex justify-center items-center min-h-[50vh]">
          <div className="w-8 h-8 rounded-full border-4 border-t-[var(--clay-teal)] border-r-[var(--clay-teal)] border-b-transparent border-l-transparent animate-spin"></div>
        </div>
      </PublicLayout>
    }>
      <ExplorarContent />
    </Suspense>
  );
}
