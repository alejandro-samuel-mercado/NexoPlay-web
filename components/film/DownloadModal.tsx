import React, { useState, useEffect, useMemo } from 'react';
import { X, Download, CheckSquare, Square, HardDrive, MonitorPlay, Volume2, MessageSquare, PlaySquare, CheckCircle2, Film, Star } from 'lucide-react';
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
    const [selectedSeasonNumber, setSelectedSeasonNumber] = useState<number>(1);
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
            if (isSeries && content?.seasons?.[0]?.number) {
                setSelectedSeasonNumber(content.seasons[0].number);
            }
            
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
        const seasonEpIds = allEpisodes.filter(e => e.seasonNumber === selectedSeasonNumber).map(e => e.id);
        const next = new Set(selectedEpisodes);
        const allSelected = seasonEpIds.every(id => next.has(id));
        
        if (allSelected) {
            seasonEpIds.forEach(id => next.delete(id));
        } else {
            seasonEpIds.forEach(id => next.add(id));
        }
        setSelectedEpisodes(next);
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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-300">
            {/* Full-screen Backdrop Image */}
            <div className="absolute inset-0 bg-black/90">
                <img src={bgImage} alt="" className="w-full h-full object-cover opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            </div>
            
            <div className={`relative w-full ${isSeries ? 'max-w-[1000px]' : 'max-w-2xl'} flex flex-col bg-[#0b0c10]/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh]`}>
                
                {/* Header */}
                <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center bg-white/5 shrink-0">
                    <h2 className="text-xl md:text-2xl font-black text-white tracking-tight line-clamp-1">
                        {content.title}
                    </h2>
                    <button 
                        onClick={onClose} 
                        disabled={isDownloading}
                        className="p-2 bg-black/40 hover:bg-white/20 rounded-full text-white/70 hover:text-white transition-all backdrop-blur-md border border-white/10 z-20 hover:scale-110 disabled:opacity-50 shrink-0 ml-4"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-hidden flex flex-col md:flex-row w-full">
                    
                    {/* Episodes Section (If Series) */}
                    {isSeries && (
                        <div className="w-full md:w-[320px] lg:w-[350px] shrink-0 border-b md:border-b-0 md:border-r border-white/10 flex flex-col bg-[#0f1115]">
                            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5 shrink-0 gap-2">
                                <div className="flex items-center gap-2 w-full">
                                    <PlaySquare size={16} className="text-emerald-400 shrink-0" />
                                    <select 
                                        value={selectedSeasonNumber}
                                        onChange={(e) => setSelectedSeasonNumber(Number(e.target.value))}
                                        className="bg-black/50 border border-white/10 rounded-lg text-white text-xs font-bold px-2 py-2 focus:outline-none focus:border-emerald-500 w-full"
                                    >
                                        {content.seasons?.map((s: any) => (
                                            <option key={s.number} value={s.number}>Temporada {s.number}</option>
                                        ))}
                                    </select>
                                </div>
                                <button 
                                    onClick={toggleAllEpisodes}
                                    className="text-[10px] uppercase font-bold px-2.5 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition whitespace-nowrap shrink-0"
                                >
                                    Toggle Todo
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar min-h-0">
                                {allEpisodes.filter(ep => ep.seasonNumber === selectedSeasonNumber).map((ep) => {
                                    const isSelected = selectedEpisodes.has(ep.id);
                                    const sNum = String(ep.seasonNumber || 1).padStart(2, '0');
                                    const eNum = String(ep.number || 1).padStart(2, '0');
                                    return (
                                        <div 
                                            key={ep.id}
                                            onClick={() => toggleEpisode(ep.id)}
                                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${isSelected ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-black/20 border-transparent hover:bg-white/5'}`}
                                        >
                                            {isSelected ? (
                                                <CheckSquare size={16} className="text-emerald-400 shrink-0" />
                                            ) : (
                                                <Square size={16} className="text-white/30 shrink-0" />
                                            )}
                                            <div className="min-w-0">
                                                <p className={`font-bold text-xs ${isSelected ? 'text-white' : 'text-white/70'} truncate`}>
                                                    S{sNum} E{eNum} - {ep.title || `Ep. ${ep.number}`}
                                                </p>
                                                <p className="text-[10px] text-white/40 mt-1">
                                                    {Math.floor((ep.durationSeconds || 0) / 60)} min
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Settings Section */}
                    <div className="flex-1 overflow-y-auto p-5 md:p-8 custom-scrollbar w-full">
                        <div className="flex items-center gap-3 mb-8">
                            <Download className="text-emerald-400" size={20} />
                            <h3 className="font-bold text-lg text-white">Configurar Descarga</h3>
                        </div>
                        
                        <div className="space-y-8 max-w-3xl">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* CODEC INFO */}
                                <div>
                                    <h3 className="font-bold text-[11px] text-white/50 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                        <Film size={14} /> Códec de Video
                                    </h3>
                                    <div className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 inline-flex items-center gap-2">
                                        <CheckCircle2 size={16} className="text-emerald-400" />
                                        <span className="font-bold text-sm text-white">{codec}</span>
                                    </div>
                                </div>

                                {/* QUALITY OPTIONS */}
                                <div>
                                    <h3 className="font-bold text-[11px] text-white/50 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                        <MonitorPlay size={14} /> Resolución
                                    </h3>
                                    <div className="flex flex-wrap gap-2.5">
                                        {qualities.map(q => (
                                            <button 
                                                key={q}
                                                onClick={() => setSelectedQuality(q)}
                                                className={`px-4 py-2 rounded-full border transition-all flex items-center gap-2 ${selectedQuality === q ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)] text-emerald-400 font-bold' : 'bg-white/5 border-white/5 hover:bg-white/10 text-white/70 font-medium'}`}
                                            >
                                                {selectedQuality === q && <CheckCircle2 size={14} />}
                                                <span className="text-sm">
                                                    {q === 'auto' ? 'Auto' : q}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <hr className="border-white/5" />

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Audio */}
                                <div>
                                    <h3 className="font-bold text-[11px] text-white/50 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                        <Volume2 size={14} /> Pista de Audio
                                    </h3>
                                    {audios.length === 0 ? (
                                        <div className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white/50 text-sm inline-flex">
                                            Idioma original
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-2.5">
                                            {audios.map((a: any, i: number) => {
                                                const lang = a.language || `Pista ${i + 1}`;
                                                return (
                                                    <button
                                                        key={i}
                                                        onClick={() => setSelectedAudio(lang)}
                                                        className={`px-4 py-2 rounded-full border transition-all flex items-center gap-2 ${selectedAudio === lang ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.15)] text-emerald-400 font-bold' : 'bg-white/5 border-white/5 hover:bg-white/10 text-white/70 font-medium'}`}
                                                    >
                                                        {selectedAudio === lang && <CheckCircle2 size={14} />}
                                                        <span className="text-sm uppercase">{lang}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Subtitles */}
                                <div>
                                    <h3 className="font-bold text-[11px] text-white/50 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                        <MessageSquare size={14} /> Subtítulos
                                    </h3>
                                    {subtitles.length === 0 ? (
                                        <div className="px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white/50 text-sm inline-flex">
                                            No detectados
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-2.5">
                                            <button
                                                onClick={() => setSelectedSubtitle('none')}
                                                className={`px-4 py-2 rounded-full border transition-all flex items-center gap-2 ${selectedSubtitle === 'none' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-bold' : 'bg-white/5 border-white/5 hover:bg-white/10 text-white/70 font-medium'}`}
                                            >
                                                {selectedSubtitle === 'none' && <CheckCircle2 size={14} />}
                                                <span className="text-sm">Ninguno</span>
                                            </button>
                                            {subtitles.map((s: any, i: number) => {
                                                const lang = s.language || `Sub ${i + 1}`;
                                                return (
                                                    <button
                                                        key={i}
                                                        onClick={() => setSelectedSubtitle(lang)}
                                                        className={`px-4 py-2 rounded-full border transition-all flex items-center gap-2 ${selectedSubtitle === lang ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-bold' : 'bg-white/5 border-white/5 hover:bg-white/10 text-white/70 font-medium'}`}
                                                    >
                                                        {selectedSubtitle === lang && <CheckCircle2 size={14} />}
                                                        <span className="text-sm uppercase">{lang} {s.isForced ? '(F)' : ''}</span>
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
                <div className="p-4 md:p-6 border-t border-white/10 bg-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0 w-full">
                    <div className="text-white/60 font-medium text-sm">
                        {isSeries ? (
                            <span><strong className="text-white text-base">{filesToDownloadCount}</strong> ep. seleccionados</span>
                        ) : (
                            <span><strong className="text-white text-base">1</strong> película</span>
                        )}
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button 
                            onClick={onClose}
                            disabled={isDownloading}
                            className="flex-1 sm:flex-none px-6 py-3 rounded-full font-bold text-sm text-white bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            onClick={handleDownloadAll}
                            disabled={isDownloading || (isSeries && filesToDownloadCount === 0)}
                            className="flex-1 sm:flex-none px-8 py-3 rounded-full font-bold text-sm text-black bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isDownloading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    <Download size={18} />
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

