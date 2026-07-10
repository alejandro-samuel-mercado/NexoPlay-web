'use client';

import PublicLayout from '@/components/layout/PublicLayout';
import { useAuth } from '@/context/AuthContext';
import { API, apiFetch } from '@/lib/api';
import { ChevronDown, ChevronUp, Crown, Download, Heart, Key, MessageCircle, Play, Star, Volume2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const TYPE_LABELS: Record<string, string> = {
  MOVIE: 'Movie', SERIES: 'Series', ANIME: 'Anime',
  DOCUMENTARY: 'Documentary', NOVELA: 'Novela',
};

export default function ContentDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoggedIn, isSubscriber } = useAuth();

  const [content, setContent] = useState<any>(null);
  const [config, setConfig] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [expandedSeason, setExpandedSeason] = useState<string | null>(null);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [pendingEpisodeId, setPendingEpisodeId] = useState<string | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeResult, setCodeResult] = useState<{ downloadUrl: string; contentTitle: string } | null>(null);
  const [codeError, setCodeError] = useState('');
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadResult, setDownloadResult] = useState<{ downloadUrl: string } | null>(null);
  const [downloadError, setDownloadError] = useState('');
  
  const [inList, setInList] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('action') === 'code') {
      setShowCodeModal(true);
    }
    
    // Fetch content and config in parallel
    Promise.all([
      apiFetch(`${API.CONTENT.DETAIL(slug)}?lang=es`).catch(() => ({ success: false })),
      apiFetch(API.CONTENT.CONFIG).catch(() => ({ data: {} }))
    ]).then(([contentRes, configRes]) => {
      if (configRes.success && configRes.data) {
        setConfig(configRes.data);
      }
      
      if (contentRes.success && contentRes.data) {
        setContent(contentRes.data);
        if (isLoggedIn) {
          apiFetch(`${API.MYLIST}/${contentRes.data.id}/check`)
            .then(r => setInList(r.data?.inList || false))
            .catch(() => {});
        }
      } else {
        throw new Error();
      }
    }).catch(() => {
      // Fallback to mock data if API is down
      setContent({
        id: 'mock-1', slug, type: 'MOVIE', title: 'Pelicula de Prueba', originalTitle: 'Test Movie', releaseYear: 2024, duration: 120, rating: 8.5,
        overview: 'Esta es una película generada automáticamente para probar el frontend mientras la API está apagada. Todo el diseño y las funciones se mantienen intactas.',
        posterUrl: 'https://image.tmdb.org/t/p/w500/AHO3Q44E41P0m34pD8I8T4Rz81f.jpg',
        backdropUrl: 'https://image.tmdb.org/t/p/w1280/AHO3Q44E41P0m34pD8I8T4Rz81f.jpg',
        downloadAllowed: true, genres: [{ genre: { name: 'Action' } }, { genre: { name: 'Sci-Fi' } }], cast: []
      });
    }).finally(() => setLoading(false));
  }, [slug, isLoggedIn]);

  const [redeemingEpisodeId, setRedeemingEpisodeId] = useState<string | null>(null);

  const handleCodeRedeem = async () => {
    if (!isLoggedIn) {
      router.push('/auth/login');
      return;
    }
    if (!code.trim()) return;
    setCodeLoading(true); setCodeError('');
    try {
      const bodyParams: any = { code: code.trim().toUpperCase() };
      if (redeemingEpisodeId) bodyParams.episodeId = redeemingEpisodeId;
      
      const res = await apiFetch(API.DOWNLOADS.REDEEM, {
        method: 'POST',
        body: JSON.stringify(bodyParams),
      });
      setCodeResult(res.data);
      setContent((prev: any) => ({ ...prev, hasUnlocked: true }));
    } catch (e: any) {
      setCodeError(e.message || 'Código inválido o ya utilizado');
    } finally { setCodeLoading(false); }
  };

  const handleSubscriberDownload = (episodeId?: string) => {
    if (!isLoggedIn) {
      router.push('/auth/login');
      return;
    }
    setPendingEpisodeId(episodeId || null);
    setShowQualityModal(true);
  };

  const confirmDownload = async () => {
    setShowQualityModal(false);
    setDownloadLoading(true); setDownloadError('');
    try {
      const url = `${API.DOWNLOADS.DOWNLOAD(content.id)}${pendingEpisodeId ? `?episodeId=${pendingEpisodeId}` : ''}`;
      const res = await apiFetch(url, { method: 'POST' });
      if (res.success && res.data?.downloadUrl) {
        setDownloadResult(res.data);
        window.open(res.data.downloadUrl, '_blank');
      } else {
        setDownloadError(res.error || 'No se pudo generar el enlace de descarga');
      }
    } catch (e: any) {
      setDownloadError(e.message || 'Error de conexión');
    } finally { setDownloadLoading(false); }
  };
  
  // Get Dynamic Options
  let currentOptions: { qualities?: any[], audioTracks?: any[] } | null = null;
  if (content) {
    if (pendingEpisodeId) {
      for (const s of content.seasons || []) {
        const ep = s.episodes?.find((e: any) => e.id === pendingEpisodeId);
        if (ep && ep.videoOptions) {
          currentOptions = ep.videoOptions;
          break;
        }
      }
    } else {
      const vf = content.videoFiles?.[0];
      if (vf) currentOptions = { qualities: vf.qualities, audioTracks: vf.audioTracks };
    }
  }
  const hasQualities = currentOptions?.qualities && currentOptions.qualities.length > 0;
  const hasAudios = currentOptions?.audioTracks && currentOptions.audioTracks.length > 1;

  const toggleMyList = async () => {
    if (!isLoggedIn) return router.push('/auth/login');
    setListLoading(true);
    try {
      if (inList) {
        await apiFetch(`${API.MYLIST}/${content.id}`, { method: 'DELETE' });
        setInList(false);
      } else {
        await apiFetch(`${API.MYLIST}/${content.id}`, { method: 'POST' });
        setInList(true);
      }
    } finally { setListLoading(false); }
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="pt-8 w-full max-w-5xl mx-auto">
          <div className="shimmer h-96 rounded-3xl mb-8" />
          <div className="shimmer h-12 w-1/3 rounded-xl mb-4" />
          <div className="shimmer h-32 rounded-xl" />
        </div>
      </PublicLayout>
    );
  }

  if (!content) return null;

  const isSeries = ['SERIES', 'ANIME', 'NOVELA'].includes(content.type);

  return (
    <PublicLayout>
      <div className="pt-6 w-full max-w-6xl mx-auto">
        {/* Backdrop Hero */}
        <div className="relative w-full h-[45vh] lg:h-[60vh] min-h-[350px] lg:min-h-[400px] mb-6 lg:mb-8 rounded-b-3xl lg:rounded-none overflow-hidden lg:overflow-visible -mt-4 lg:mt-0">
          {content.backdropUrl ? (
            <img src={content.backdropUrl} alt={content.title} className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-main)] to-[var(--bg-hover)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-main)] via-[var(--bg-main)]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-main)]/80 via-transparent to-transparent hidden lg:block" />

          <div className="absolute bottom-4 left-4 right-4 lg:bottom-10 lg:left-10 lg:right-auto flex gap-6 lg:gap-8 items-end">
            {/* Poster Float */}
            {content.posterUrl && (
              <img src={content.posterUrl} alt={content.title}
                className="w-32 lg:w-48 rounded-xl lg:rounded-2xl shadow-2xl hidden md:block border border-[var(--border-subtle)]" />
            )}
            <div>
               <div className="flex flex-wrap gap-1.5 lg:gap-2 mb-3 lg:mb-4">
                  <span className="glass-pill text-[#FFD700]">
                    <Star size={12} fill="currentColor" /> {content.rating ? content.rating.toFixed(1) : 'N/A'}
                  </span>
                  <span className="glass-pill">{content.releaseYear}</span>
                  <span className="glass-pill">{TYPE_LABELS[content.type] || content.type}</span>
                  {content.duration && <span className="glass-pill">{content.duration} min</span>}
               </div>
               <h1 className="text-3xl md:text-5xl font-black text-white drop-shadow-lg mb-4 line-clamp-2">{content.title}</h1>
               
               <div className="flex flex-wrap items-center gap-3 lg:gap-4">
                  {/* Watch / Preview */}
                  {isSubscriber || content.hasUnlocked ? (
                    <button onClick={() => router.push(`/contenido/${slug}/watch`)}
                      className="btn-primary flex-1 sm:flex-none justify-center">
                      <Play size={18} fill="currentColor" /> Reproducir
                    </button>
                  ) : (
                    <>
                      {content.price > 0 ? (
                        <button onClick={() => {
                          const wppNumber = config?.whatsappNumber || '1234567890';
                          const msg = `Hola, me gustaría comprar el código para el contenido: ${content.title} (${TYPE_LABELS[content.type] || content.type}), que tiene un costo de $${content.price}.`;
                          window.open(`https://wa.me/${wppNumber.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
                        }}
                          className="btn-primary flex-1 sm:flex-none justify-center" style={{ backgroundColor: '#25D366', color: '#fff' }}>
                          <MessageCircle size={18} fill="currentColor" /> Comprar por ${content.price}
                        </button>
                      ) : null}
                      <button onClick={() => router.push(`/contenido/${slug}/preview`)}
                        className="btn-clay btn-clay-dark flex-1 sm:flex-none justify-center">
                        <Key size={18} /> Canjear Código
                      </button>
                    </>
                  )}

                  <button onClick={toggleMyList} disabled={listLoading}
                    className={`btn-icon-rounded shrink-0 w-12 h-12 ${inList ? 'text-[#FF6B6B] bg-white/10' : ''}`}>
                    <Heart size={20} fill={inList ? 'currentColor' : 'none'} />
                  </button>
               </div>
            </div>
          </div>
        </div>

        {/* Content Info & Download Section */}
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-10">
          
          <div className="lg:col-span-2 space-y-10">
             
             {/* Non-Subscriber CTA Banner */}
             {!isSubscriber && !content.hasUnlocked && (
               <div className="bg-gradient-to-r from-[#25D366]/20 to-[var(--clay-primary)]/20 border border-[#25D366]/30 rounded-2xl p-5 flex flex-col md:flex-row items-center gap-4">
                 <div className="w-12 h-12 bg-[#25D366]/20 rounded-full flex items-center justify-center shrink-0">
                   <Crown className="text-[var(--clay-yellow)]" size={24} />
                 </div>
                 
                 {!isLoggedIn ? (
                   <>
                     <div>
                       <h3 className="text-white font-bold mb-1">Guarda tu progreso y favoritos</h3>
                       <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                         Inicia sesión o regístrate para poder guardar tu historial y lista de descargas. Una vez dentro, podrás decidir si activar una suscripción premium o solicitar un código individual.
                       </p>
                     </div>
                     <div className="shrink-0 flex flex-col gap-2 w-full md:w-auto">
                       <Link href="/auth/registro" className="btn-clay text-center text-sm py-2 px-4">Crear Cuenta</Link>
                       <Link href="/auth/login" className="btn-clay btn-clay-dark text-center text-sm py-2 px-4">Ingresar</Link>
                     </div>
                   </>
                 ) : (
                   <>
                     <div>
                       <h3 className="text-white font-bold mb-1">Activa tu Suscripción Premium</h3>
                       <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                         Para obtener acceso ilimitado a todo el catálogo sin tener que comprar códigos individuales, solicita la activación de tu suscripción directamente por WhatsApp.
                       </p>
                     </div>
                     <div className="shrink-0 flex flex-col gap-2 w-full md:w-auto">
                       <button onClick={() => {
                         const wppNumber = config?.whatsappNumber || '1234567890';
                         const msg = `Hola, ya tengo una cuenta en NexoPlay (Email: ${user?.email}) y me gustaría activar mi suscripción premium.`;
                         window.open(`https://wa.me/${wppNumber.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
                       }} className="btn-clay text-center text-sm py-2 px-4" style={{ backgroundColor: '#25D366', color: '#fff' }}>
                         Solicitar Suscripción
                       </button>
                     </div>
                   </>
                 )}
               </div>
             )}

             {/* Synopsis */}
             <section>
                <h3 className="text-xl font-bold text-white mb-4">Synopsis</h3>
                <p className="text-[#8B8B9B] leading-relaxed text-[15px]">
                  {content.translations?.[0]?.description || 'Sin descripción disponible.'}
                </p>
             </section>

             {/* Genres */}
             {content.genres?.length > 0 && (
                <section>
                  <h3 className="text-xl font-bold text-white mb-4">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {content.genres.map((g: any) => (
                      <span key={g.id} className="filter-pill active !py-1.5 !px-4 text-sm">{g.name}</span>
                    ))}
                  </div>
                </section>
             )}

             {/* Episodes (if Series) */}
             {isSeries && content.seasons?.length > 0 && (
                <section>
                   <h3 className="text-xl font-bold text-white mb-4">Episodes</h3>
                   <div className="space-y-3">
                     {content.seasons.sort((a: any, b: any) => a.seasonNumber - b.seasonNumber).map((season: any) => (
                        <div key={season.id} className="bg-[#1C1C22] rounded-2xl overflow-hidden border border-white/5">
                          <button onClick={() => setExpandedSeason(expandedSeason === season.id ? null : season.id)}
                            className="w-full flex items-center justify-between p-4 hover:bg-[#26262D] transition-colors">
                            <span className="font-bold text-white">Season {season.seasonNumber}</span>
                            <div className="flex items-center gap-3 text-sm text-[#8B8B9B]">
                              <span>{season.episodes?.length || 0} episodes</span>
                              {expandedSeason === season.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>
                          </button>
                          {expandedSeason === season.id && (
                            <div className="border-t border-white/5 bg-[#121215]/50">
                              {season.episodes.sort((a: any, b: any) => a.number - b.number).map((ep: any) => (
                                <div key={ep.id} className="flex items-center justify-between p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                                  <div className="flex items-center gap-4">
                                    <span className="text-lg font-bold text-white/20 w-8">{ep.number}</span>
                                    {ep.thumbnailUrl && (
                                      <img src={ep.thumbnailUrl} alt="" className="w-24 h-14 object-cover rounded-lg border border-white/10" />
                                    )}
                                    <div>
                                      <p className="text-sm font-bold text-white mb-1">{ep.title || `Episode ${ep.number}`}</p>
                                      {ep.duration && <p className="text-xs text-[#8B8B9B]">{ep.duration} min</p>}
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    {content.downloadAllowed && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (isSubscriber || content.hasUnlocked) {
                                            handleSubscriberDownload(ep.id);
                                          } else if (!isLoggedIn) {
                                            router.push('/auth/login');
                                          } else {
                                            setRedeemingEpisodeId(ep.id);
                                            setShowCodeModal(true);
                                          }
                                        }}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/50 hover:text-white"
                                        title="Descargar Episodio"
                                      >
                                        <Download size={18} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                     ))}
                   </div>
                </section>
             )}
          </div>

          {/* Download Sidebar */}
          <div className="lg:col-span-1">
             <div className="sticky top-28 bg-[var(--bg-panel)] rounded-3xl p-6 border border-[var(--border-subtle)] shadow-xl">
               <h3 className="text-lg font-bold text-[var(--text-main)] mb-6 flex items-center gap-2">
                 <Download size={20} className="text-[#FFD700]" /> Download {isSeries ? 'Complete Series' : 'Movie'}
               </h3>
               
               {content.downloadAllowed ? (
                 <div className="space-y-6">
                    {/* Subscription Download */}
                    <div>
                      {isSubscriber || content.hasUnlocked ? (
                        <>
                          <button onClick={() => handleSubscriberDownload()} disabled={downloadLoading}
                            className="w-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] rounded-xl font-bold py-3.5 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50">
                            {downloadLoading ? 'Procesando...' : (isSubscriber ? 'Descargar Ahora (1 Crédito)' : 'Descargar Ahora (Desbloqueado)')}
                          </button>
                          <p className="text-center text-xs text-[var(--text-muted)] mt-2">
                            {isSubscriber ? 'La re-descarga de este contenido es gratuita.' : 'Tienes acceso permanente a esta descarga.'}
                          </p>
                        </>
                      ) : (
                        <div className="text-center bg-[var(--bg-hover)] rounded-xl p-4 border border-[var(--border-subtle)]">
                          <Crown size={24} className="text-[#FFD700] mx-auto mb-2" />
                          <p className="text-sm text-[var(--text-main)] font-semibold mb-2">Exclusivo para Suscriptores</p>
                          <button onClick={() => router.push('/admin/planes')} className="text-xs text-[var(--text-muted)] underline">Ver planes premium</button>
                        </div>
                      )}
                    </div>

                    {downloadResult && (
                      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
                        <a href={downloadResult.downloadUrl} target="_blank" rel="noopener"
                          className="text-green-600 dark:text-green-400 font-bold text-sm flex items-center justify-center gap-2">
                          <Download size={16} /> Link Generado (Click para iniciar)
                        </a>
                      </div>
                    )}
                    {downloadError && <p className="text-red-500 text-xs text-center">{downloadError}</p>}

                    {!content.hasUnlocked && (
                      <>
                        {/* Divider */}
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-px bg-[var(--border-strong)]" />
                          <span className="text-[10px] uppercase text-[var(--text-muted)] font-bold">O usa un código</span>
                          <div className="flex-1 h-px bg-[var(--border-strong)]" />
                        </div>

                        {/* Code Redeem */}
                        <div>
                          <button onClick={() => setShowCodeModal(true)}
                            className="w-full bg-transparent border border-[var(--border-focus)] text-[var(--text-main)] rounded-xl font-semibold py-3 flex items-center justify-center gap-2 hover:bg-[var(--bg-hover)] transition-colors">
                            <Key size={16} /> Canjear código de invitado
                          </button>
                        </div>
                      </>
                    )}
                 </div>
               ) : (
                 <div className="text-center py-6">
                   <p className="text-[var(--text-muted)] text-sm">Este contenido no está disponible para descarga.</p>
                 </div>
               )}
             </div>
          </div>

        </div>
      </div>

      {/* Code Redeem Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[var(--bg-panel)] w-full max-w-sm rounded-3xl p-6 border border-[var(--border-strong)] shadow-2xl relative">
            <button onClick={() => { setShowCodeModal(false); setCodeResult(null); setCodeError(''); setCode(''); setRedeemingEpisodeId(null); }}
              className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-main)]">✕</button>
            
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-[var(--border-strong)] rounded-full flex items-center justify-center mx-auto mb-3">
                <Key size={20} className="text-[var(--text-main)]" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-main)]">Canjear Código</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">Ingresa el código proporcionado por un administrador.</p>
            </div>

            {codeResult ? (
              <div className="text-center">
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl mb-4 text-green-600 dark:text-green-400">
                  <p className="text-xs mb-2">¡Código validado correctamente!</p>
                  <p className="font-bold">{codeResult.contentTitle}</p>
                </div>
                <a href={codeResult.downloadUrl} target="_blank" rel="noopener"
                  className="w-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-bold rounded-xl py-3 flex items-center justify-center gap-2">
                  <Download size={18} /> Iniciar descarga
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                <input type="text" placeholder="EJ: NEXO-XXXX-XXXX" value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border-strong)] rounded-xl px-4 py-3 text-center font-mono font-bold text-[var(--text-main)] uppercase focus:border-[var(--border-focus)] focus:outline-none" />
                
                {codeError && <p className="text-red-500 text-xs text-center">{codeError}</p>}
                
                <button onClick={handleCodeRedeem} disabled={codeLoading || !code}
                  className="w-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-bold rounded-xl py-3 flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50">
                  {codeLoading ? 'Verificando...' : 'Canjear'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Visual Info Modal */}
      {showQualityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[var(--bg-panel)] w-full max-w-sm rounded-3xl p-6 border border-[var(--border-strong)] shadow-2xl relative">
            <button onClick={() => setShowQualityModal(false)}
              className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-main)]">✕</button>
            
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-[var(--border-strong)] rounded-full flex items-center justify-center mx-auto mb-3">
                <Download size={20} className="text-[var(--text-main)]" />
              </div>
              <h3 className="text-lg font-bold text-[var(--text-main)]">Detalles de Descarga</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                El archivo incluye las siguientes resoluciones y pistas:
              </p>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto mb-6">
              {/* Qualities */}
              <div>
                <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Resoluciones Incluidas</h4>
                <div className="flex flex-wrap gap-2">
                  {hasQualities ? (
                    currentOptions!.qualities!.map((q: any) => (
                      <span key={q.resolution} className="bg-[var(--bg-main)] border border-[var(--border-strong)] rounded-full px-3 py-1 text-sm text-[var(--text-main)]">
                        ✔️ {q.resolution}
                      </span>
                    ))
                  ) : (
                    <span className="bg-[var(--bg-main)] border border-[var(--border-strong)] rounded-full px-3 py-1 text-sm text-[var(--text-main)]">
                      ✔️ Mejor Calidad Disponible
                    </span>
                  )}
                </div>
              </div>

              {/* Audio Tracks */}
              {hasAudios && (
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Audios Incluidos</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentOptions!.audioTracks!.map((a: any) => (
                      <span key={a.language} className="bg-[var(--bg-main)] border border-[var(--border-strong)] rounded-full px-3 py-1 text-sm text-[var(--text-main)] flex items-center gap-1">
                        <Volume2 size={12}/> {a.label || a.language}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => confirmDownload()}
              className="w-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-bold rounded-xl py-4 flex items-center justify-center gap-2 hover:opacity-90">
              <Download size={18} /> Confirmar Descarga
            </button>
          </div>
        </div>
      )}
    </PublicLayout>
  );
}
