'use client';

import { useState, useEffect, Suspense } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import PublicLayout from '@/components/layout/PublicLayout';
import SeriviaGrid from '@/components/catalog/SeriviaGrid';
import { API_ROUTES } from '@/lib/api-routes';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialQuery = searchParams.get('search') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Sync local query state if URL changes externally
  useEffect(() => {
    setQuery(searchParams.get('search') || '');
  }, [searchParams]);

  // Fetch results when query changes (with debounce)
  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`${API_ROUTES.SEARCH.SEARCH}?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        if (json.success) {
          // If the API returns movies in data.data or directly in data
          setResults(json.data?.data || json.data || []);
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error('Error fetching search results:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounceId = setTimeout(fetchResults, 400); // 400ms debounce
    return () => clearTimeout(debounceId);
  }, [query]);

  // Update URL as user types
  const handleQueryChange = (val: string) => {
    setQuery(val);
    const params = new URLSearchParams(searchParams.toString());
    if (val.trim()) {
      params.set('search', val);
    } else {
      params.delete('search');
    }
    router.replace(`/buscar?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex-1 pt-12 text-[var(--text-main)] flex flex-col relative !px-4 sm:!px-[6vw] !pb-[20vh] min-h-screen">
      {/* Search Input Sticky Header */}
      <div className="w-full border-b border-[var(--border-subtle)] pb-6 mb-8 top-0 z-40 sticky pt-4 bg-[var(--bg-main)]/90 backdrop-blur-md">
        <div className="relative max-w-4xl mx-auto flex items-center">
          <Search className="absolute left-4 text-[var(--text-muted)]" size={28} />
          <input 
            type="text" 
            autoFocus
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Títulos, personas, géneros..." 
            className="w-full bg-[var(--bg-panel)] text-[var(--text-main)] text-xl md:text-2xl outline-none placeholder-[var(--text-faint)] pl-14 pr-12 py-4 rounded border border-[var(--border-subtle)] focus:border-[var(--border-strong)] shadow-inner transition-colors"
          />
          {query && (
            <button onClick={() => handleQueryChange('')} className="absolute right-4 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
              <X size={28} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full">
        <AnimatePresence>
          {!query && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[var(--text-faint)] text-center py-20">
              <Search size={64} className="mx-auto mb-4 opacity-50" />
              <p className="text-xl">Encuentra tus películas, series o actores favoritos.</p>
            </motion.div>
          )}

          {query && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
              <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-[var(--text-muted)] font-medium text-lg">
                    Explorando resultados para "{query}"
                  </h2>
                  {loading && <Loader2 size={18} className="animate-spin text-[var(--color-primary)]" />}
              </div>
              
              {!loading && results.length === 0 ? (
                <div className="text-center py-20 text-[var(--text-faint)]">
                    <p className="text-xl">No se encontraron resultados.</p>
                </div>
              ) : (
                <SeriviaGrid items={results} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <PublicLayout>
        <Suspense fallback={<div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center"><Loader2 className="animate-spin text-[var(--color-primary)]" size={48} /></div>}>
            <SearchContent />
        </Suspense>
    </PublicLayout>
  );
}
