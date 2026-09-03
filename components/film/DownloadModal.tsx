import React, { useState, useEffect, useMemo } from 'react';
import { X, Download, CheckSquare, Square, HardDrive, MonitorPlay, Volume2, MessageSquare, PlaySquare, CheckCircle2, Film } from 'lucide-react';
import { API_ROUTES, resolveImageUrl } from '@/lib/api-routes';
import { userFetch } from '@/lib/api-client';

interface DownloadModalProps {
    isOpen: boolean;
    onClose: () => void;
    content: any;
}

export default function DownloadModal({ isOpen, onClose, content }: DownloadModalProps) {
    const [selectedEpisodes, setSelectedEpisodes] = useState<Set<string>>(new Set());
    const [selectedQuality, setSelectedQuality] = useState<string>('auto');
    const [selectedAudio, setSelectedAudio] = useState<string>('');
    const [selectedSubtitle, setSelectedSubtitle] = useState<string>('none');
    const [isDownloading, setIsDownloading] = useState(false);

    // Close on escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    // Prevent background scrolling
    useEffect(() => {
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'auto';
        return () => { document.body.style.overflow = 'auto'; };
    }, [isOpen]);

    const isSeries = ['SERIES', 'ANIME', 'NOVELA'].includes(content?.type);
    
    // Flat list of episodes with season info
    const allEpisodes = useMemo(() => {
        if (!content || !isSeries || !content.seasons) return [];
        let eps: any[] = [];
        content.seasons.forEach((s: any) => {
            if (s.episodes) {
                s.episodes.forEach((e: any) => {
                    eps.push({ ...e, seasonNumber: s.number });
                });
            }
        });
        return eps;
    }, [content, isSeries]);

    // Extract common options from the first available video file
    const referenceVideoFile = useMemo(() => {
        if (!content) return null;
        if (!isSeries && content.videoFiles?.length > 0) return content.videoFiles[0];
        if (isSeries && allEpisodes.length > 0) {
            const epWithVideo = allEpisodes.find(e => e.videoFiles?.length > 0);
            return epWithVideo?.videoFiles?.[0];
        }
        return null;
    }, [content, isSeries, allEpisodes]);

    const qualities = useMemo(() => {
        const qs = referenceVideoFile?.qualities?.map((q: any) => q.resolution).filter(Boolean) || [];
        return [...new Set<string>([...qs, 'auto'])];
    }, [referenceVideoFile]);

    const audios = useMemo(() => {
        return referenceVideoFile?.audioTracks || [];
    }, [referenceVideoFile]);

    const subtitles = useMemo(() => {
        return referenceVideoFile?.subtitleTracks || [];
    }, [referenceVideoFile]);

    const codec = referenceVideoFile?.codec || 'H.264 / AAC';
    
    // Default selections on open
    useEffect(() => {
        if (isOpen) {
            setSelectedQuality('auto');
            if (audios.length > 0) setSelectedAudio(audios[0].language || '');
            else setSelectedAudio('');
            
            setSelectedSubtitle('none'); 
            
            if (isSeries && allEpisodes.length > 0) {
                // Select only the first episode by default to prevent accidental massive downloads
                setSelectedEpisodes(new Set([allEpisodes[0].id]));
            } else {
                setSelectedEpisodes(new Set());
            }
        }
    }, [isOpen, audios, subtitles, isSeries, allEpisodes]);

    if (!isOpen || !content) return null;

    const toggleEpisode = (epId: string) => {
        const next = new Set(selectedEpisodes);
        if (next.has(epId)) next.delete(epId);
        else next.add(epId);
        setSelectedEpisodes(next);
    };

    const toggleAllEpisodes = () => {
        if (selectedEpisodes.size === allEpisodes.length) {
            setSelectedEpisodes(new Set());
        } else {
            setSelectedEpisodes(new Set(allEpisodes.map(e => e.id)));
        }
    };

    const handleDownloadAll = async () => {
        if (isSeries && selectedEpisodes.size === 0) {
            alert('Debes seleccionar al menos un episodio para descargar.');
            return;
        }

        setIsDownloading(true);
        try {
            const token = localStorage.getItem('nexo_access_token');
            const profileId = localStorage.getItem('nexo_active_profile_id');
            if (!token) { alert('Debes iniciar sesión para descargar'); return; }

            const downloadIds = isSeries ? Array.from(selectedEpisodes) : [null]; // null means movie

            for (const epId of downloadIds) {
                const baseUrl = epId
                    ? `${API_ROUTES.CONTENT.BASE}/${content.id}/download?episodeId=${epId}&quality=${selectedQuality}${selectedAudio ? '&audio=' + encodeURIComponent(selectedAudio) : ''}`
                    : `${API_ROUTES.CONTENT.BASE}/${content.id}/download?quality=${selectedQuality}${selectedAudio ? '&audio=' + encodeURIComponent(selectedAudio) : ''}`;
                
                const res = await userFetch(baseUrl, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        ...(profileId ? { 'X-Profile-Id': profileId } : {}),
                    }
                });

                if (!res.ok) {
                    const errJson = await res.json().catch(() => null);
                    alert(`Error en un archivo: ${errJson?.error || 'Enlace no disponible'}`);
                    continue; 
                }

                const json = await res.json();
                if (json.success && json.data?.downloadUrl) {
                    const iframe = document.createElement('iframe');
                    iframe.style.display = 'none';
                    iframe.src = json.data.downloadUrl;
                    document.body.appendChild(iframe);
                    
                    // Remove iframe after 10 seconds to keep DOM clean, 
                    // the download will have already started
                    setTimeout(() => {
                        if (document.body.contains(iframe)) {
                            document.body.removeChild(iframe);
                        }
                    }, 10000);
                }
                
                // Prevent browser blocking multiple popups/downloads
                if (downloadIds.length > 1) {
                    await new Promise(r => setTimeout(r, 1500));
                }
            }
            onClose();
        } catch (err: any) {
            alert(err.message || 'Error al iniciar la descarga');
        } finally {
            setIsDownloading(false);
        }
    };

    const bgImage = resolveImageUrl(content.backdropUrl || content.posterUrl);
    const filesToDownloadCount = isSeries ? selectedEpisodes.size : 1;

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-2 md:p-4 animate-in fade-in duration-300">
            {/* Backdrop with blur */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={!isDownloading ? onClose : undefined} />
            
            <div className="relative w-full max-w-[1400px] h-full max-h-[98vh] md:max-h-[95vh] bg-[#0b0c10] border border-white/10 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl shadow-emerald-500/10 flex flex-col">
                
                {/* Header */}
                <div className="relative p-4 md:p-5 border-b border-white/10 overflow-hidden shrink-0">
                    {/* Header Background */}
                    <div className="absolute inset-0 opacity-20 mask-image-b">
                        <img src={bgImage} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0b0c10] via-[#0b0c10]/80 to-transparent" />
                    
                    <div className="relative flex justify-between items-start">
                        <div>
                            <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
                                <Download className="text-emerald-400" size={24} />
                                Centro de Descargas
                            </h2>
                            <p className="text-white/60 mt-0.5 text-xs md:text-sm font-medium">{content.title}</p>
                        </div>
                        <button 
                            onClick={onClose} 
                            disabled={isDownloading}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-black/40">
                    
                    {/* LEFT COLUMN: Episodes (Only if Series) */}
                    {isSeries && (
                        <div className="w-full md:w-4/12 lg:w-3/12 border-b md:border-b-0 md:border-r border-white/10 flex flex-col bg-[#0f1115]">
                            <div className="p-3 border-b border-white/5 flex justify-between items-center bg-white/5 shrink-0">
                                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                                    <PlaySquare size={16} className="text-emerald-400" />
                                    Episodios
                                </h3>
                                <button 
                                    onClick={toggleAllEpisodes}
                                    className="text-[10px] uppercase font-bold px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-white transition"
                                >
                                    {selectedEpisodes.size === allEpisodes.length ? 'Desmarcar' : 'Marcar Todos'}
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                                {allEpisodes.map((ep) => {
                                    const isSelected = selectedEpisodes.has(ep.id);
                                    const sNum = String(ep.seasonNumber || 1).padStart(2, '0');
                                    const eNum = String(ep.number || 1).padStart(2, '0');
                                    return (
                                        <div 
                                            key={ep.id}
                                            onClick={() => toggleEpisode(ep.id)}
                                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border ${isSelected ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-black/20 border-transparent hover:bg-white/5'}`}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                {isSelected ? (
                                                    <CheckSquare size={16} className="text-emerald-400 shrink-0" />
                                                ) : (
                                                    <Square size={16} className="text-white/30 shrink-0" />
                                                )}
                                                <div>
                                                    <p className={`font-semibold text-xs ${isSelected ? 'text-white' : 'text-white/70'} line-clamp-1`}>
                                                        S{sNum} E{eNum} - {ep.title || `Ep. ${ep.number}`}
                                                    </p>
                                                    <p className="text-[10px] text-white/40 mt-0.5">
                                                        {Math.floor((ep.durationSeconds || 0) / 60)} min
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* RIGHT COLUMN: Settings */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-5 custom-scrollbar">
                        <div className="max-w-4xl mx-auto space-y-5">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* CODEC INFO */}
                                <div>
                                    <h3 className="font-bold text-xs text-white/50 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <Film size={14} /> Códec de Video
                                    </h3>
                                    <div className="p-2.5 rounded-lg border border-white/10 bg-white/5 inline-flex items-center gap-2">
                                        <CheckCircle2 size={14} className="text-emerald-400" />
                                        <span className="font-medium text-xs text-white">{codec}</span>
                                    </div>
                                </div>

                                {/* QUALITY OPTIONS */}
                                <div>
                                    <h3 className="font-bold text-xs text-white/50 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <MonitorPlay size={14} /> Resolución
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {qualities.map(q => (
                                            <button 
                                                key={q}
                                                onClick={() => setSelectedQuality(q)}
                                                className={`px-4 py-2 rounded-lg border transition-all ${selectedQuality === q ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)] text-emerald-400 font-bold' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 text-white/70'}`}
                                            >
                                                <span className="text-xs">
                                                    {q === 'auto' ? 'Automática' : q}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <hr className="border-white/5" />

                            {/* Audio & Subtitles */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Audio */}
                                <div>
                                    <h3 className="font-bold text-xs text-white/50 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <Volume2 size={14} /> Pista de Audio
                                    </h3>
                                    {audios.length === 0 ? (
                                        <div className="p-2.5 rounded-lg border border-white/10 bg-white/5 text-white/50 text-xs">
                                            Idioma original (Por defecto)
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-2">
                                            {audios.map((a: any, i: number) => {
                                                const lang = a.language || `Pista ${i + 1}`;
                                                return (
                                                    <button
                                                        key={i}
                                                        onClick={() => setSelectedAudio(lang)}
                                                        className={`p-2.5 rounded-lg border flex items-center justify-between transition-all ${selectedAudio === lang ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.15)] text-emerald-400 font-bold' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 text-white/70'}`}
                                                    >
                                                        <span className="text-xs uppercase">{lang}</span>
                                                        {selectedAudio === lang && <CheckCircle2 size={14} />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Subtitles */}
                                <div>
                                    <h3 className="font-bold text-xs text-white/50 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <MessageSquare size={14} /> Subtítulos (Opcional)
                                    </h3>
                                    {subtitles.length === 0 ? (
                                        <div className="p-2.5 rounded-lg border border-white/10 bg-white/5 text-white/50 text-xs">
                                            No detectados
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-2">
                                            <button
                                                onClick={() => setSelectedSubtitle('none')}
                                                className={`p-2.5 rounded-lg border flex items-center justify-between transition-all ${selectedSubtitle === 'none' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-bold' : 'bg-white/5 border-white/5 hover:bg-white/10 text-white/70'}`}
                                            >
                                                <span className="text-xs">Ninguno</span>
                                                {selectedSubtitle === 'none' && <CheckCircle2 size={14} />}
                                            </button>
                                            {subtitles.map((s: any, i: number) => {
                                                const lang = s.language || `Sub ${i + 1}`;
                                                return (
                                                    <button
                                                        key={i}
                                                        onClick={() => setSelectedSubtitle(lang)}
                                                        className={`p-2.5 rounded-lg border flex items-center justify-between transition-all ${selectedSubtitle === lang ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-bold' : 'bg-white/5 border-white/5 hover:bg-white/10 text-white/70'}`}
                                                    >
                                                        <span className="text-xs uppercase">{lang} {s.isForced ? '(Forzado)' : ''}</span>
                                                        {selectedSubtitle === lang && <CheckCircle2 size={14} />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 bg-[#0b0c10] flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
                    <div className="text-white/60 font-medium text-xs">
                        {isSeries ? (
                            <span><strong className="text-white text-sm">{filesToDownloadCount}</strong> ep. seleccionados</span>
                        ) : (
                            <span><strong className="text-white text-sm">1</strong> película</span>
                        )}
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button 
                            onClick={onClose}
                            disabled={isDownloading}
                            className="flex-1 sm:flex-none px-5 py-2.5 rounded-full font-bold text-xs text-white bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={handleDownloadAll}
                            disabled={isDownloading || (isSeries && filesToDownloadCount === 0)}
                            className="flex-1 sm:flex-none px-6 py-2.5 rounded-full font-bold text-xs text-black bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isDownloading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    <Download size={16} />
                                    Descargar {filesToDownloadCount > 1 ? `(${filesToDownloadCount})` : ''}
                                </>
                            )}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
