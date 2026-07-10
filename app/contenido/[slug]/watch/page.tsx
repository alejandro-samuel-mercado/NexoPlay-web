'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { API, apiFetch } from '@/lib/api';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function WatchPlayerPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { isSubscriber, isLoading } = useAuth();
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isLoading) return;
    
    if (!isSubscriber) {
      router.push(`/contenido/${slug}/preview`);
      return;
    }

    // Fetch full watch info
    apiFetch(`${API.CONTENT.DETAIL(slug)}/watch`)
      .then(res => {
        if (res.success) {
          setContent(res.data);
        } else {
          setError(res.error || 'Error al cargar el video');
        }
      })
      .catch(err => {
        setError(err.message || 'Error de conexión');
      })
      .finally(() => setLoading(false));
  }, [slug, isSubscriber, isLoading]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-black">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="clay-skeleton w-32 h-32 rounded-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0A0A10]">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="clay-card-dark p-8 rounded-[24px] text-center max-w-md border-[3px] border-[var(--clay-red)]">
            <AlertTriangle size={48} className="mx-auto mb-4 text-[var(--clay-red)]" />
            <h2 className="text-xl font-bold text-white mb-2">Error</h2>
            <p className="text-[#A8B3C8] mb-6">{error}</p>
            <Link href={`/contenido/${slug}`} className="btn-clay btn-clay-dark w-full">Volver</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!content) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A10]">
      {/* Absolute top bar for player context */}
      <div className="absolute top-0 left-0 right-0 p-6 z-50 flex items-center justify-between"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)' }}>
        <Link href={`/contenido/${slug}`} className="btn-clay btn-clay-dark btn-clay-sm flex items-center gap-2">
          <ArrowLeft size={16} /> Volver
        </Link>
        <div className="text-right">
          <h1 className="text-lg font-black text-white">{content.title}</h1>
          <span className="clay-badge text-[10px] border-[var(--clay-teal)] text-[var(--clay-teal)] bg-[#1A1A2E]/80 backdrop-blur">
            REPRODUCCIÓN PREMIUM
          </span>
        </div>
      </div>

      {/* Video Container */}
      <div className="relative flex-1 flex items-center justify-center bg-black">
        {content.masterPlaylist ? (
          <video
            ref={videoRef}
            src={content.masterPlaylist}
            className="w-full h-full object-contain max-h-screen"
            controls
            autoPlay
            controlsList="nodownload"
          >
            Tu navegador no soporta el reproductor de video.
          </video>
        ) : (
          <div className="text-center p-8">
            <AlertTriangle size={48} className="mx-auto mb-4 text-[#FF6B6B]" />
            <h2 className="text-xl font-bold text-white mb-2">Video no disponible</h2>
            <p className="text-[#A8B3C8]">El archivo de video no fue encontrado en los servidores.</p>
          </div>
        )}
      </div>
    </div>
  );
}
