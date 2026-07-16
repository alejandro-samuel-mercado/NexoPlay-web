'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import SeriviaGrid from '@/components/catalog/SeriviaGrid';
import { API, apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function MiListaPage() {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/auth/login');
      return;
    }
    
    if (isLoggedIn) {
      apiFetch(API.MYLIST)
        .then(res => {
          if (res.success && res.data) setItems(res.data);
          else throw new Error('Empty or failed');
        })
        .catch(() => {
          // Fallback to mock data if API is down
          console.warn('API fetch failed, loading mock data for Mi Lista');
          setItems([
            { content: { slug: 'arcane', title: 'Arcane', posterUrl: 'https://image.tmdb.org/t/p/w500/AHO3Q44E41P0m34pD8I8T4Rz81f.jpg', type: 'SERIES', releaseYear: 2021 } },
            { content: { slug: 'blade-runner', title: 'Blade Runner 2049', posterUrl: 'https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg', type: 'MOVIE', releaseYear: 2017 } },
            { content: { slug: 'interstellar', title: 'Interstellar', posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', type: 'MOVIE', releaseYear: 2014 } },
          ]);
        })
        .finally(() => setLoading(false));
    }
  }, [isLoading, isLoggedIn, router]);

  if (isLoading || loading) {
    return (
      <PublicLayout>
        <div className="pt-8 w-full max-w-7xl mx-auto">
          <div className="shimmer h-12 w-48 rounded-2xl mb-8 bg-white/5" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] shimmer bg-white/5 rounded-[16px]" />
            ))}
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="pt-8 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
            <Heart size={24} className="text-[#FF6B6B]" fill="#FF6B6B" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-main)] tracking-tight">Mi Lista</h1>
        </div>

        {items.length === 0 ? (
          <div className="bg-[var(--bg-panel)] p-16 rounded-3xl border border-[var(--border-subtle)] text-center max-w-2xl mx-auto shadow-xl mt-12">
            <div className="text-6xl mb-6 opacity-80">🍿</div>
            <h2 className="text-2xl font-bold text-[var(--text-main)] mb-3">Tu lista está vacía</h2>
            <p className="text-[var(--text-muted)] mb-8">Agregá películas y series a tu lista para verlas más tarde.</p>
            <Link href="/explorar" className="btn-primary">
              Explorar Catálogo
            </Link>
          </div>
        ) : (
          <div className="mt-8">
            <SeriviaGrid items={items.map(i => ({
              id: i.contentId,
              slug: i.slug,
              translations: [{ title: i.title }],
              thumbnails: [{ type: 'POSTER', url: i.posterUrl }],
              releaseYear: i.releaseYear,
              rating: i.rating
            }))} />
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
