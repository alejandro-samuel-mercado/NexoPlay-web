'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Key, Lock, AlertTriangle, MessageCircle } from 'lucide-react';
import PublicLayout from '@/components/layout/PublicLayout';
import { API, apiFetch } from '@/lib/api';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function PreviewPlayerPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { isSubscriber } = useAuth();
  const [content, setContent] = useState<any>(null);
  const [config, setConfig] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const PREVIEW_DURATION = 180; // 3 minutes in seconds

  useEffect(() => {
    // Fetch preview info and config
    Promise.all([
      apiFetch(`${API.CONTENT.DETAIL(slug)}/preview`),
      fetch(API.CONTENT.CONFIG).then(r => r.json()).catch(() => ({ data: {} }))
    ]).then(([res, configRes]) => {
      if (configRes.success && configRes.data) {
        setConfig(configRes.data);
      }
      
      if (res.success) {
        setContent(res.data);
      } else {
        router.push(`/film/${slug}`);
      }
    }).finally(() => setLoading(false));
  }, [slug]);

  // Handle time update to lock video after X minutes
  const handleTimeUpdate = () => {
    if (!videoRef.current || isSubscriber) return; // Subscribers don't get locked

    if (videoRef.current.currentTime >= PREVIEW_DURATION) {
      videoRef.current.pause();
      setLocked(true);
      // Optional: exit full screen if they are in it
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(e => console.log(e));
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] flex flex-col items-center justify-center">
        <div className="clay-skeleton w-16 h-16 rounded-full mb-4" />
        <p className="text-[var(--text-muted)] animate-pulse">Preparando preview...</p>
      </div>
    );
  }

  if (!content) return null;

  return (
    <PublicLayout>
      <div className="flex-1 bg-[var(--bg-main)] text-white relative flex items-center justify-center min-h-[80vh]">
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 lg:p-8 z-50 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
          <button onClick={() => router.push(`/film/${slug}`)} 
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
            <ArrowLeft size={24} />
            <span className="font-semibold drop-shadow-md">Volver</span>
          </button>
          <div className="bg-[#FF6B6B]/90 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-md">
            PREVIEW GRATUITO
          </div>
        </div>

        {/* Video Player */}
        <div className="flex-1 relative flex items-center justify-center">
          {content.videoUrl ? (
            <video
              ref={videoRef}
              src={content.videoUrl}
              className="w-full h-full object-contain"
              controls={!locked}
              controlsList="nodownload"
              autoPlay
              onTimeUpdate={handleTimeUpdate}
              onContextMenu={e => e.preventDefault()}
            />
          ) : (
            <div className="text-center p-8">
              <AlertTriangle size={48} className="text-[#FF6B6B] mx-auto mb-4" />
              <p className="text-white text-xl">Preview no disponible en este momento.</p>
            </div>
          )}

          {/* Lock Overlay */}
          {locked && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-40 p-4">
              <div className="clay-card-dark max-w-md w-full p-8 text-center rounded-[32px] border-[2px] border-[#3A3A5C]">
                <div className="w-20 h-20 bg-gradient-to-br from-[#FF6B6B] to-[#FF4757] rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-500/20 rotate-12">
                  <Lock size={32} className="text-white -rotate-12" />
                </div>
                
                <h2 className="text-2xl font-black text-white mb-2">Tiempo Finalizado</h2>
                <p className="text-[#A8B3C8] text-sm mb-8">
                  El preview gratuito de 3 minutos ha terminado. Para seguir viendo o descargar <strong>{content.title}</strong>, necesitás una suscripción o un código.
                </p>
                
                <div className="space-y-3">
                  {content.price > 0 ? (
                    <button onClick={() => {
                      const wppNumber = config?.whatsappNumber || '1234567890';
                      const msg = `Hola, me gustaría comprar el código para el contenido: ${content.title}, que tiene un costo de $${content.price}.`;
                      window.open(`https://wa.me/${wppNumber.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
                    }} className="btn-clay w-full flex items-center justify-center gap-2" style={{ backgroundColor: '#25D366', color: '#fff' }}>
                      <MessageCircle size={18} fill="currentColor" /> Comprar Código por ${content.price}
                    </button>
                  ) : null}
                  <Link href={`/film/${slug}?action=code`} className="btn-clay btn-clay-yellow w-full flex items-center justify-center gap-2">
                    <Key size={18} /> Tengo un código
                  </Link>
                  <Link href="/auth/login" className="btn-clay btn-clay-teal w-full flex items-center justify-center gap-2">
                    Iniciar sesión
                  </Link>
                  <Link href={`/film/${slug}`} className="btn-clay btn-clay-dark w-full">
                    Volver al detalle
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
