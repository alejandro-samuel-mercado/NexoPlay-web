'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search as SearchIcon } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import ContentCard from '@/components/content/ContentCard';
import { API, apiFetch } from '@/lib/api';
import { useDebounce } from 'use-debounce';

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery] = useDebounce(query, 500);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searched, setSearched] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debouncedQuery.trim().length > 0) {
      setLoading(true);
      setSearched(true);
      // Update URL silently
      const url = new URL(window.location.href);
      url.searchParams.set('q', debouncedQuery);
      window.history.replaceState({}, '', url);

      setPage(1);
      
      apiFetch(`${API.CONTENT.BASE}?search=${encodeURIComponent(debouncedQuery)}&limit=24&page=1`)
        .then(res => {
          if (res.success) {
            setResults(res.data || []);
            setHasMore((res.data || []).length === 24);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setResults([]);
      setSearched(false);
      // Remove q from URL
      const url = new URL(window.location.href);
      url.searchParams.delete('q');
      window.history.replaceState({}, '', url);
    }
  }, [debouncedQuery]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    
    apiFetch(`${API.CONTENT.BASE}?search=${encodeURIComponent(debouncedQuery)}&limit=24&page=${nextPage}`)
      .then(res => {
        if (res.success) {
          setResults(prev => [...prev, ...(res.data || [])]);
          setHasMore((res.data || []).length === 24);
          setPage(nextPage);
        }
      })
      .finally(() => setLoadingMore(false));
  }, [loadingMore, hasMore, page, debouncedQuery]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '400px' }
    );

    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [loadMore, hasMore, loading, loadingMore]);

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl sm:text-5xl font-black text-white text-center mb-8">
            ¿Qué estás <span style={{ color: 'var(--clay-teal)' }}>buscando?</span>
          </h1>
          
          <div className="relative">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Películas, series, anime..." 
              className="clay-input w-full text-lg sm:text-xl py-4 pl-14 pr-6 rounded-[20px] font-bold text-white placeholder-[#6B7280]"
              autoFocus
            />
            <SearchIcon size={24} className="absolute left-5 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="clay-skeleton aspect-[2/3] rounded-[16px]" />
            ))}
          </div>
        ) : searched && results.length > 0 ? (
          <div>
            <p className="text-[#A8B3C8] font-bold mb-6">Resultados para "{debouncedQuery}"</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6 mb-8">
              {results.map(item => (
                <ContentCard key={item.id} item={item} />
              ))}
            </div>
            
            {hasMore && (
              <div ref={observerTarget} className="flex justify-center mt-8 py-4">
                {loadingMore && <div className="clay-skeleton w-12 h-12 rounded-full animate-spin" />}
              </div>
            )}
          </div>
        ) : searched && results.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🤔</div>
            <h2 className="text-2xl font-black text-white mb-2">No encontramos nada</h2>
            <p className="text-[#6B7280]">Probá con otros términos de búsqueda.</p>
          </div>
        ) : null}
      </main>
    </>
  );
}

export default function BuscarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
        <Navbar />
        <div className="flex-1 flex justify-center items-center">
          <div className="w-8 h-8 rounded-full border-4 border-t-[var(--clay-teal)] border-r-[var(--clay-teal)] border-b-transparent border-l-transparent animate-spin"></div>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
