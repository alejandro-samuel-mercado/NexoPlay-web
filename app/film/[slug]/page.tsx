'use client';
import { userFetch } from '@/lib/api-client';

import FilmRow from '@/components/catalog/FilmRow';
import FilmComments from '@/components/film/FilmComments';
import TrailerModal from '@/components/film/TrailerModal';
import { useAuth } from '@/context/AuthContext';
import { API_ROUTES, resolveImageUrl } from '@/lib/api-routes';
import { getContentTypeLabel } from '@/lib/content-types';
import { ArrowLeft, Calendar, Check, ChevronDown, Clapperboard, Clock, DollarSign, Download, Globe, MonitorPlay, Play, Plus, Star, ThumbsUp, Users } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

// Types that have seasons/episodes
const SERIES_TYPES = ['SERIES', 'ANIME', 'NOVELA', 'REALITY_SHOW', 'TALK_SHOW', 'VARIETY_SHOW', 'EDUCATIONAL', 'KIDS', 'FAMILY', 'DOCUDRAMA'];

// Friendly type labels
const TYPE_LABELS: Record<string, string> = {
    // We'll use the central getContentTypeLabel instead
};

export default function FilmDetailPage() {
    const params = useParams();
    const id = params.slug as string;
    const [content, setContent] = useState<any>(null);
    const [related, setRelated] = useState<any[]>([]);
    const [trending, setTrending] = useState<any[]>([]);
    const [recommended, setRecommended] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isTrailerOpen, setIsTrailerOpen] = useState(false);
    const [selectedSeason, setSelectedSeason] = useState(0);
    const { user: authUser, refreshUser, isReseller } = useAuth();
    const [isFavorited, setIsFavorited] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const favToggledRef = useRef(false);
    const likeToggledRef = useRef(false);

    // ── Sync profileId from server on page load ──────────────────────────────
    useEffect(() => {
        if (!authUser) return;
        const syncProfileId = async () => {
            const token = localStorage.getItem('accessToken');
            if (!token) return;
            try {
                const res = await userFetch(API_ROUTES.PROFILES.LIST, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const json = await res.json();
                const profiles: any[] = json?.data ?? [];
                if (profiles.length > 0) {
                    const stored = localStorage.getItem('nexo_active_profile_id');
                    const isValid = profiles.some((p: any) => p.id === stored);
                    if (!isValid) {
                        localStorage.setItem('nexo_active_profile_id', profiles[0].id);
                    }
                }
            } catch (e) { console.error('[profileSync]', e); }
        };
        syncProfileId();
    }, [authUser]);

    // ── Check initial favorite/like state ────────────────────────────────────
    useEffect(() => {
        const checkFav = async () => {
            if (!content?.id) return;
            const token = localStorage.getItem('accessToken');
            const profileId = localStorage.getItem('nexo_active_profile_id');
            if (!token || !profileId) return;
            try {
                const res = await userFetch(`${API_ROUTES.FAVORITES.BASE}/check/${content.id}`);
                const json = await res.json();
                if (json.success && !favToggledRef.current) setIsFavorited(json.data.isFavorited);
            } catch (err) { console.error(err); }
        };
        if (authUser && content?.id) checkFav();
    }, [content?.id, authUser]);

    useEffect(() => {
        const checkLike = async () => {
            if (!content?.id) return;
            const token = localStorage.getItem('accessToken');
            const profileId = localStorage.getItem('nexo_active_profile_id');
            if (!token || !profileId) return;
            try {
                const res = await userFetch(API_ROUTES.LIKES.CHECK(content.id));
                const json = await res.json();
                if (json.success && !likeToggledRef.current) setIsLiked(json.data.isLiked);
            } catch (err) { console.error(err); }
        };
        if (authUser && content?.id) checkLike();
    }, [content?.id, authUser]);

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleToggleFavorite = async (e?: any) => {
        e?.preventDefault();
        const token = localStorage.getItem('accessToken');
        const profileId = localStorage.getItem('nexo_active_profile_id');
        if (!token) { alert('Debes iniciar sesión para guardar favoritos.'); return; }
        if (!profileId) { alert('Por favor, selecciona un perfil primero.'); return; }

        favToggledRef.current = true;
        const prev = isFavorited;
        setIsFavorited(!prev);

        try {
            const res = await userFetch(API_ROUTES.FAVORITES.TOGGLE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contentId: content?.id })
            });
            const json = await res.json();
            
            if (json.success && json.data?.error === 'invalid_reference') {
                console.warn('[Page] invalid_reference detected, attempting to fix profileId...');
                try {
                    const profilesRes = await userFetch(API_ROUTES.PROFILES.LIST, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const profilesJson = await profilesRes.json();
                    const firstProfile = profilesJson?.data?.[0] || profilesJson?.data?.profiles?.[0];
                    if (firstProfile?.id) {
                        console.log('[Page] fixed profileId from', profileId, 'to', firstProfile.id);
                        localStorage.setItem('nexo_active_profile_id', firstProfile.id);
                        
                        const retryRes = await userFetch(API_ROUTES.FAVORITES.TOGGLE, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ contentId: content?.id })
                        });
                        const retryJson = await retryRes.json();
                        if (retryJson.success && !retryJson.data?.error) {
                            setIsFavorited(retryJson.data.favorited);
                        } else {
                            console.error('[Page] retry failed:', retryJson);
                            setIsFavorited(prev);
                        }
                    } else {
                        console.error('[Page] no valid profiles found during retry');
                        setIsFavorited(prev);
                    }
                } catch (retryErr) {
                    console.error('[Page] retry exception:', retryErr);
                    setIsFavorited(prev);
                }
            } else if (json.success && !json.data?.error) {
                setIsFavorited(json.data.favorited);
            } else {
                console.error('[Page] normal toggle failed:', json);
                setIsFavorited(prev);
            }
        } catch (err) {
            console.error('[Page] toggle exception:', err);
            setIsFavorited(prev);
        }
    };

    const handleToggleLike = async (e?: any) => {
        e?.preventDefault();
        const token = localStorage.getItem('accessToken');
        const profileId = localStorage.getItem('nexo_active_profile_id');
        if (!token) { alert('Debes iniciar sesión para dar me gusta.'); return; }
        if (!profileId) { alert('Por favor, selecciona un perfil primero.'); return; }

        likeToggledRef.current = true;
        const prev = isLiked;
        setIsLiked(!prev);

        try {
            const res = await userFetch(API_ROUTES.LIKES.TOGGLE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contentId: content?.id })
            });
            const json = await res.json();
            if (json.success && !json.data?.error) {
                setIsLiked(json.data.liked);
            } else {
                console.error('[Page] normal toggle like failed:', json);
                setIsLiked(prev); // rollback on error
            }
        } catch (err) {
            console.error('[Page] toggle like exception:', err);
            setIsLiked(prev); // rollback on exception
        }
    };
    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await fetch(`${API_ROUTES.CONTENT.BASE}/${id}`, { cache: 'no-store' });
                const resJson = await res.json();
                if (resJson.success && resJson.data) setContent(resJson.data);

                const [relatedRes, trendingRes, recommendedRes] = await Promise.all([
                    fetch(`${API_ROUTES.CONTENT.BASE}/${id}/related`),
                    fetch(`${API_ROUTES.CONTENT.TRENDING}`),
                    fetch(`${API_ROUTES.CONTENT.FEATURED}`)
                ]);

                const [relatedJson, trendingJson, recommendedJson] = await Promise.all([
                    relatedRes.json(),
                    trendingRes.json(),
                    recommendedRes.json()
                ]);

                if (relatedJson.success && relatedJson.data) setRelated(relatedJson.data);
                if (trendingJson.success && trendingJson.data) setTrending(trendingJson.data.filter((item: any) => item.id !== id));
                if (recommendedJson.success && recommendedJson.data) setRecommended(recommendedJson.data.filter((item: any) => item.id !== id));
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchContent();
    }, [id]);

    if (loading) return <div className="w-full flex-1 flex flex-col items-center justify-center min-h-screen text-white">
        <div className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin mb-4"></div>
        <span className="font-bold tracking-widest text-sm uppercase text-[var(--text-muted)]">Cargando  contenido...</span>
    </div>;
    if (!content) return <div className="w-full flex-1 flex flex-col items-center justify-center min-h-screen text-white">
        <span className="font-bold tracking-widest text-lg uppercase text-[var(--text-muted)]">Contenido no encontrado</span>
    </div>;

    const translation = content.translations?.[0] || { title: 'Sin título', description: '' };
    const thumbnails = content.thumbnails || [];
    const poster = thumbnails.find((t: any) => t.type === 'POSTER')?.url;
    const backdrop = thumbnails.find((t: any) => t.type === 'BACKDROP')?.url || poster;
    const genres = (content.genres || []).map((g: any) => g.genre);
    const directors = (content.directors || []).map((d: any) => d.director);
    const cast = (content.actors || []).slice(0, 15);
    const isSeries = SERIES_TYPES.includes(content.type);
    const seasons = content.seasons || [];
    const currentSeason = seasons[selectedSeason];

    const backdropUrl = resolveImageUrl(backdrop);
    const posterUrl = resolveImageUrl(poster);
    const hasEpisodesWithVideo = seasons.some((s: any) =>
        s.episodes?.some((e: any) =>
            e.videoFiles && e.videoFiles.some((v: any) => v.status === 'COMPLETED')
        )
    );
    const hasDirectVideo = content.videoFiles && content.videoFiles.some((v: any) => v.status === 'COMPLETED');
    const canPlay = (content.status === 'READY' || content.status === 'ACTIVE') && (hasEpisodesWithVideo || hasDirectVideo);
    const formatMoney = (n:    return (
        <main className="relative min-h-screen text-white pb-24 overflow-x-hidden">
            <TrailerModal url={content.trailerUrl || ''} isOpen={isTrailerOpen} onClose={() => setIsTrailerOpen(false)} />

            {/* ═══ HERO BANNER ═══ */}
            <section className="relative w-full min-h-[90vh] flex flex-col justify-end pt-32 pb-16 px-6 md:px-12 lg:px-20 overflow-hidden">
                {/* Background Image & Gradients */}
                {backdropUrl && (
                    <div 
                        className="absolute inset-0 z-0 bg-cover bg-[center_15%] scale-105" 
                        style={{ backgroundImage: `url(${backdropUrl})` }}
                    />
                )}
                <div className="absolute inset-0 z-0 bg-gradient-to-r from-[var(--bg-main)] via-[var(--bg-main)]/70 to-transparent" />
                <div className="absolute inset-0 z-0 bg-gradient-to-t from-[var(--bg-main)] via-[var(--bg-main)]/40 to-transparent" />

                {/* Back Button */}
                <div className="absolute top-24 left-6 md:left-12 lg:left-20 z-50">
                    <Link href="/" className="flex items-center justify-center w-12 h-12 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10 hover:border-white/30 transition-all shadow-lg">
                        <ArrowLeft size={24} />
                    </Link>
                </div>

                {/* Hero Content */}
                <div className="relative z-10 w-full max-w-4xl">
                    {/* Badges */}
                    <div className="flex items-center gap-3 flex-wrap mb-6">
                        {content.featured && (
                            <span className="bg-gradient-to-r from-orange-500 to-rose-500 text-white px-3 py-1 text-[10px] font-black rounded uppercase tracking-widest shadow-lg">
                                TOP 10
                            </span>
                        )}
                        <span className="bg-white/5 backdrop-blur-xl border border-white/10 text-white px-3 py-1 text-[10px] font-black rounded uppercase tracking-widest">
                            {getContentTypeLabel(content.type)}
                        </span>
                        {content.isAdult && (
                            <span className="bg-red-500/20 border border-red-500/40 text-red-300 px-3 py-1 text-[10px] font-black rounded uppercase tracking-widest">
                                +18
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 uppercase tracking-tight leading-[0.95] drop-shadow-2xl">
                        {translation.title}
                    </h1>

                    {/* Meta bar */}
                    <div className="flex items-center gap-4 text-sm md:text-base font-bold text-gray-300 mb-8 flex-wrap">
                        {content.releaseYear && <span className="bg-white/10 px-3 py-0.5 rounded text-white">{content.releaseYear}</span>}
                        {content.ageRating && <span className="border border-white/30 px-2.5 py-0.5 rounded text-xs text-white">{content.ageRating.code}</span>}
                        {content.duration && !isSeries && <span>{content.duration} min</span>}
                        {isSeries && seasons.length > 0 && <span>{seasons.length} temporada{seasons.length > 1 ? 's' : ''}</span>}
                        {content.rating > 0 && (
                            <div className="flex items-center gap-1.5 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                                <span className="text-white font-black">{content.rating}</span>
                            </div>
                        )}
                    </div>

                    {/* Synopsis */}
                    <div className="max-h-48 overflow-y-auto mb-10 pr-4 custom-scrollbar">
                        <p className="text-gray-300 text-base md:text-lg leading-relaxed font-medium drop-shadow-md">
                            {translation.description}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4 flex-wrap">
                        {canPlay ? (
                            <Link href={`/film/${id}/watch`} className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-black font-black rounded-2xl text-sm shadow-[0_4px_20px_0_rgba(255,255,255,0.25)] hover:bg-gray-100 hover:scale-105 transition-all">
                                <Play size={20} className="fill-black" /> REPRODUCIR
                            </Link>
                        ) : (
                            <button disabled className="flex items-center justify-center gap-3 px-8 py-4 bg-white/10 text-white/50 font-black rounded-2xl text-sm border border-white/10 cursor-not-allowed">
                                <Play size={20} className="fill-current" /> PRÓXIMAMENTE
                            </button>
                        )}
                        
                        {content.trailerUrl && (
                            <button onClick={() => setIsTrailerOpen(true)} className="flex items-center justify-center gap-3 px-8 py-4 bg-white/5 backdrop-blur-xl border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 hover:border-white/30 transition-all shadow-lg">
                                <MonitorPlay size={20} /> TRÁILER
                            </button>
                        )}

                        {/* RBAC: Revendedor B2B Button */}
                        {isReseller && content.downloadAllowed && (
                            <button className="flex items-center justify-center gap-3 px-8 py-4 bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/30 text-emerald-400 font-black rounded-2xl hover:bg-emerald-500/20 transition-all shadow-lg">
                                <Download size={20} /> DESCARGAR 4K
                            </button>
                        )}

                        {/* RBAC: B2C Tokens Button */}
                        {!isReseller && content.downloadAllowed && (
                            <button className="flex items-center justify-center gap-3 px-8 py-4 bg-amber-500/10 backdrop-blur-xl border border-amber-500/30 text-amber-400 font-black rounded-2xl hover:bg-amber-500/20 transition-all shadow-lg">
                                <DollarSign size={20} /> USAR TOKENS
                            </button>
                        )}

                        <div className="flex items-center gap-3 ml-auto sm:ml-0">
                            <button
                                onClick={handleToggleFavorite}
                                className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all shadow-lg ${isFavorited ? 'border-[var(--text-main)] bg-[var(--text-main)] text-black' : 'border-white/10 bg-white/5 backdrop-blur-xl text-white hover:bg-white/10'}`}
                                title={isFavorited ? "Quitar de mi lista" : "Añadir a mi lista"}
                            >
                                {isFavorited ? <Check size={24} /> : <Plus size={24} />}
                            </button>
                             <button
                                onClick={handleToggleLike}
                                className={`w-14 h-14 rounded-2xl border flex items-center justify-center transition-all shadow-lg ${isLiked ? 'border-[var(--text-main)] bg-[var(--text-main)] text-black' : 'border-white/10 bg-white/5 backdrop-blur-xl text-white hover:bg-white/10'}`}
                                title="Me gusta"
                            >
                                <ThumbsUp size={22} className={isLiked ? "fill-current" : ""} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══ SEASONS & EPISODES ═══ */}
            {isSeries && seasons.length > 0 && (
                <section className="relative z-10 px-6 md:px-12 lg:px-20 mt-12">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <h3 className="text-xl font-black tracking-widest text-white uppercase">
                            Episodios
                        </h3>
                        {seasons.length > 1 && (
                            <div className="relative">
                                <select
                                    value={selectedSeason}
                                    onChange={e => setSelectedSeason(Number(e.target.value))}
                                    className="appearance-none bg-white/5 backdrop-blur-xl border border-white/10 text-white px-6 py-3 pr-12 rounded-xl text-sm font-bold cursor-pointer hover:bg-white/10 hover:border-white/30 transition-all outline-none"
                                >
                                    {seasons.map((s: any, i: number) => (
                                        <option key={s.id} value={i} className="bg-[#0b0f19] text-white">
                                            Temporada {s.number} {s.translations?.[0]?.title ? `— ${s.translations[0].title}` : ''}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {(currentSeason?.episodes || []).map((ep: any) => {
                            const epTitle = ep.translations?.[0]?.title || `Episodio ${ep.number}`;
                            const epDesc = ep.translations?.[0]?.description || '';
                            const epThumb = ep.thumbnails?.[0]?.url;
                            const epReady = ep.videoFiles?.some((v: any) => v.status === 'COMPLETED');
                            return (
                                <Link
                                    href={`/film/${id}/watch?episodeId=${ep.id}`}
                                    key={ep.id}
                                    className="group flex gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all backdrop-blur-sm"
                                >
                                    <div className="relative w-32 aspect-[16/9] rounded-xl overflow-hidden shrink-0 bg-white/5">
                                        {epThumb && <img src={resolveImageUrl(epThumb)} alt={epTitle} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />}
                                        {epReady && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 group-hover:scale-110 group-hover:bg-white group-hover:text-black transition-all">
                                                    <Play size={12} className="ml-1 fill-current" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 py-1">
                                        <h5 className="text-sm font-bold text-white mb-1 truncate">
                                            <span className="text-gray-400 mr-2">{ep.number}.</span>
                                            {epTitle}
                                        </h5>
                                        {epDesc && <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{epDesc}</p>}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* ═══ MAIN CONTENT AREA ═══ */}
            <section className="relative z-10 px-6 md:px-12 lg:px-20 mt-16">
                
                {/* ── Cast Section ── */}
                {cast.length > 0 && (
                    <div className="mb-16">
                        <h3 className="text-xl font-black tracking-widest text-white uppercase mb-8 flex items-center gap-3">
                            <Users size={20} className="text-gray-400" />
                            Reparto
                        </h3>
                        <div className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar">
                            {cast.map((a: any, i: number) => (
                                <div key={i} className="shrink-0 w-28 text-center group">
                                    <div className="w-24 h-24 mx-auto rounded-full overflow-hidden mb-3 border border-white/10 bg-white/5 group-hover:border-white/30 transition-colors shadow-lg">
                                        {a.actor.photoUrl ? (
                                            <img src={a.actor.photoUrl} alt={a.actor.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500 text-2xl font-black">
                                                {a.actor.name?.[0]}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm font-bold text-white leading-tight mb-1">{a.actor.name}</p>
                                    {a.character && <p className="text-xs text-gray-500 leading-tight">{a.character}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Info Grid ── */}
                <div className="mb-16">
                    <h3 className="text-xl font-black tracking-widest text-white uppercase mb-8 flex items-center gap-3">
                        <Clapperboard size={20} className="text-gray-400" />
                        Detalles
                    </h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-10">
                        {directors.length > 0 && <DetailItem icon={<Clapperboard />} label="Director" value={directors.map((d: any) => d.name).join(', ')} />}
                        {content.originalLanguage && <DetailItem icon={<Globe />} label="Idioma" value={content.originalLanguage.toUpperCase()} />}
                        {content.releaseYear && <DetailItem icon={<Calendar />} label="Año" value={String(content.releaseYear)} />}
                        {content.country && <DetailItem icon={<Globe />} label="País" value={content.country} />}
                        {content.platform && <DetailItem icon={<MonitorPlay />} label="Plataforma" value={content.platform.name} />}
                    </div>

                    {/* Genres & Tags */}
                    <div className="flex flex-col gap-4">
                        {genres.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {genres.map((g: any) => (
                                    <Link href={`/explorar?genreId=${g.id}`} key={g.id} className="px-5 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-gray-300 hover:bg-white/10 hover:text-white transition-all uppercase tracking-wider backdrop-blur-sm shadow-sm">
                                        {g.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                        {content.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {content.tags.map((t: any) => (
                                    <Link href={`/explorar?tagId=${t.tag.id}`} key={t.tag.id} className="px-4 py-1.5 bg-white/5 rounded-lg text-[11px] font-bold text-gray-400 hover:bg-white/10 hover:text-white transition-all backdrop-blur-sm">
                                        #{t.tag.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </section>

            {/* ── Comments ── */}
            {canPlay && (
                <div className="relative z-10 px-6 md:px-12 lg:px-20 mt-8">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 md:p-10 shadow-2xl">
                        <FilmComments contentId={id as string} />
                    </div>
                </div>
            )}

            {/* ── Related Content Rows ── */}
            <div className="relative z-10 px-6 md:px-12 lg:px-20 mt-20 flex flex-col gap-16">
                {related.length > 0 && (
                    <div className="pt-16 border-t border-white/10">
                        <FilmRow
                            title="Contenido Relacionado"
                            items={related.map(item => ({
                                id: item.id,
                                title: item.translations?.[0]?.title || item.slug,
                                posterUrl: resolveImageUrl(item.thumbnails?.find((th: any) => th.type === 'POSTER')?.url),
                                backdropUrl: resolveImageUrl(item.thumbnails?.find((th: any) => th.type === 'BACKDROP')?.url),
                                rating: item.rating,
                                year: item.releaseYear,
                                type: item.type
                            }))}
                        />
                    </div>
                )}

                {recommended.length > 0 && (
                    <FilmRow
                        title="Te Puede Gustar"
                        subtitle="Recomendaciones basadas en nuestro contenido"
                        items={recommended.map(item => ({
                            id: item.id,
                            title: item.translations?.[0]?.title || item.slug,
                            posterUrl: resolveImageUrl(item.thumbnails?.find((th: any) => th.type === 'POSTER')?.url),
                            backdropUrl: resolveImageUrl(item.thumbnails?.find((th: any) => th.type === 'BACKDROP')?.url),
                            rating: item.rating,
                            year: item.releaseYear,
                            type: item.type
                        }))}
                    />
                )}
            </div>
        </main>
    );
}

// ── Small helper component ──
function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="p-4 bg-white/5 border border-white/5 rounded-2xl backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2 text-gray-400">
                {React.cloneElement(icon as React.ReactElement, { size: 14 })}
                <span className="text-[10px] font-black tracking-widest uppercase">{label}</span>
            </div>
            <p className="text-base font-bold text-white truncate">{value}</p>
        </div>
    );
}
