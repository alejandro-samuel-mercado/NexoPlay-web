'use client';

import ContentCard from '@/components/content/ContentCard';
import PublicLayout from '@/components/layout/PublicLayout';
import { API } from '@/lib/api';
import { ChevronLeft, ChevronRight, Crown, Heart, Play } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/context/ProfileContext';
import { useRouter } from 'next/navigation';
import AdBanner from '@/components/ads/AdBanner';
import SponsoredListAd from '@/components/ads/SponsoredListAd';

export default function HomePage() {
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const { activeProfile, profiles, isLoading: profileLoading } = useProfile();
  const router = useRouter();
  
  const [featured, setFeatured] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);
  const [activeFilter, setActiveFilter] = useState('Trending');

  const [filters, setFilters] = useState<string[]>(['Trending']);

  useEffect(() => {
    if (!authLoading && !profileLoading && isLoggedIn && profiles.length > 0 && !activeProfile) {
      router.push('/profiles');
    }
  }, [isLoggedIn, authLoading, profileLoading, profiles, activeProfile, router]);

  useEffect(() => {
    const MOCK_HERO = [
      { id: '1', title: 'Arcane', slug: 'arcane', type: 'SERIES', releaseYear: 2021, backdropUrl: 'https://image.tmdb.org/t/p/w1280/AHO3Q44E41P0m34pD8I8T4Rz81f.jpg' },
      { id: '2', title: 'Blade Runner 2049', slug: 'blade-runner', type: 'MOVIE', releaseYear: 2017, backdropUrl: 'https://image.tmdb.org/t/p/w1280/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg' }
    ];
    const MOCK_TRENDING = [
      { id: '1', title: 'Arcane', slug: 'arcane', type: 'SERIES', releaseYear: 2021, rating: 9.1, posterUrl: 'https://image.tmdb.org/t/p/w500/AHO3Q44E41P0m34pD8I8T4Rz81f.jpg' },
      { id: '2', title: 'Blade Runner 2049', slug: 'blade-runner', type: 'MOVIE', releaseYear: 2017, rating: 8.0, posterUrl: 'https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg' },
      { id: '3', title: 'Dune', slug: 'dune', type: 'MOVIE', releaseYear: 2021, rating: 8.0, posterUrl: 'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg' },
      { id: '4', title: 'Interstellar', slug: 'interstellar', type: 'MOVIE', releaseYear: 2014, rating: 8.6, posterUrl: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg' },
      { id: '5', title: 'The Batman', slug: 'the-batman', type: 'MOVIE', releaseYear: 2022, rating: 7.8, posterUrl: 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg' },
      { id: '6', title: 'Joker', slug: 'joker', type: 'MOVIE', releaseYear: 2019, rating: 8.4, posterUrl: 'https://image.tmdb.org/t/p/w500/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg' }
    ];
    const mockGenres = ['Adventure', 'Action', 'Comedy', 'Crime', 'Drama', 'Fantasy', 'Horror', 'Sci-Fi'];

    Promise.all([
      fetch(`${API.CONTENT.FEATURED}?lang=es`).then(r => r.json()).catch(() => ({ success: false })),
      fetch(`${API.CONTENT.TRENDING}?lang=es`).then(r => r.json()).catch(() => ({ success: false })),
      fetch(API.CONTENT.GENRES).then(r => r.json()).catch(() => ({ success: false })),
    ]).then(([featRes, trendRes, genresRes]) => {
      setFeatured(featRes.success && featRes.data?.length ? featRes.data : MOCK_HERO);
      setTrending(trendRes.success && trendRes.data?.length ? trendRes.data : MOCK_TRENDING);
      setFilters(['Trending', ...(genresRes.success && genresRes.data?.length ? genresRes.data.map((g: any) => g.name) : mockGenres)]);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  // Auto-rotate hero
  useEffect(() => {
    if (featured.length < 2) return;
    const t = setInterval(() => setHeroIndex((i) => (i + 1) % Math.min(featured.length, 5)), 6000);
    return () => clearInterval(t);
  }, [featured.length]);

  const hero = featured[heroIndex] || null;

  return (
    <PublicLayout>
      {/* Hero Section */}
      <div className="relative w-full h-[40vh] md:h-[50vh] min-h-[300px] md:min-h-[400px] rounded-[24px] md:rounded-[32px] overflow-hidden mb-6 md:mb-8 group">
        {loading ? (
          <div className="absolute inset-0 shimmer" />
        ) : hero ? (
          <>
            <img src={hero.backdropUrl || hero.posterUrl} alt={hero.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-main)] via-[var(--bg-main)]/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-main)] via-transparent to-transparent opacity-80" />
            
            {/* Top Left Tags */}
            <div className="absolute top-4 left-4 md:top-8 md:left-8 flex flex-wrap gap-2">
              <span className="glass-pill">1h 56min</span>
              <span className="glass-pill">Action</span>
              <span className="glass-pill">{hero.type === 'MOVIE' ? 'Movie' : 'Series'}</span>
              {hero.releaseYear && <span className="glass-pill">{hero.releaseYear}</span>}
            </div>

            {/* Pagination Dots (Top Right) */}
            <div className="absolute top-4 right-4 md:top-8 md:right-8 flex gap-1.5">
              {featured.slice(0, 5).map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === heroIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/30'}`} />
              ))}
            </div>

            {/* Bottom Content */}
            <div className="absolute bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-8 flex items-end justify-between">
              <div className="flex items-center gap-3 md:gap-4">
                {/* Play Button */}
                <Link href={`/contenido/${hero.slug}`} className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:scale-110 transition-transform cursor-pointer border border-white/10 shrink-0">
                  <Play fill="white" size={20} className="ml-1 text-white md:w-6 md:h-6" />
                </Link>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-1 drop-shadow-lg line-clamp-1">{hero.title}</h1>
                  <p className="text-xs md:text-sm text-gray-300 font-medium">Play trailer 2:30</p>
                </div>
              </div>
              
              {/* Heart Button */}
              <button className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors backdrop-blur-sm shrink-0">
                <Heart size={18} className="text-white md:w-5 md:h-5" />
              </button>
            </div>
          </>
        ) : null}
      </div>
      {/* ─── FILTERS ROW ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-4 md:mb-8 overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4 lg:mx-0 lg:px-0">
        {filters.map((filter) => (
          <button 
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`filter-pill ${activeFilter === filter ? 'active' : ''} shrink-0`}
          >
            {filter}
          </button>
        ))}
        
        <div className="flex-1" />
        
        {/* Scroll arrows */}
        <div className="items-center gap-2 hidden sm:flex">
          <button className="w-9 h-9 rounded-full bg-[var(--bg-panel)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
            <ChevronLeft size={18} />
          </button>
          <button className="w-9 h-9 rounded-full bg-[var(--bg-panel)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      
      {/* ─── AD BANNER ─────────────────────────────────────────────────────── */}
      <AdBanner />

      {/* ─── SPONSORED LIST AD ─────────────────────────────────────────────── */}
      <SponsoredListAd />

      {/* ─── INFO BANNER CTA ─────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[var(--clay-primary)]/20 to-[var(--clay-teal)]/20 border border-[var(--clay-primary)]/30 rounded-2xl p-4 md:p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-sm">
        <div>
          <h2 className="text-lg md:text-xl font-bold text-white mb-1 flex items-center gap-2">
            <Crown size={20} className="text-[var(--clay-yellow)]" />
            Únete a NexoPlay
          </h2>
          <p className="text-sm text-[var(--text-muted)] max-w-2xl">
            Crea tu cuenta gratis para guardar tu historial y favoritos. Luego podrás activar una suscripción premium o comprar películas individuales por WhatsApp.
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto shrink-0">
          <Link href="/auth/registro" className="btn-clay flex-1 text-center justify-center">
            Crear Cuenta
          </Link>
          <Link href="/auth/login" className="btn-clay btn-clay-dark flex-1 text-center justify-center">
            Ingresar
          </Link>
        </div>
      </div>

      {/* ─── GRID CONTENT ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-6">
        {loading
          ? Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] shimmer rounded-[16px] md:rounded-[24px]" />
            ))
          : trending.map((item) => (
              <ContentCard key={item.id} item={item} />
            ))}
      </div>
    </PublicLayout>
  );
}
