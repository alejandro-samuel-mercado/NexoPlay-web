'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, Minimize, 
  Settings, ArrowLeft, Loader2, SkipForward, SkipBack 
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface CustomVideoPlayerProps {
  url: string;
  title: string;
  contentId: string;
  episodeId?: string;
  onClose: () => void;
}

export default function CustomVideoPlayer({ url, title, contentId, episodeId, onClose }: CustomVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // HLS Data
  const [qualities, setQualities] = useState<{height: number, level: number}[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1); // -1 = auto
  const [audioTracks, setAudioTracks] = useState<any[]>([]);
  const [currentAudio, setCurrentAudio] = useState<number>(0);
  
  // UI states
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedTimeRef = useRef<number>(0);
  const isReadyRef = useRef<boolean>(false);

  // Resume Playback Logic
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const query = episodeId ? `?episodeId=${episodeId}` : '';
        const res = await apiFetch(`/api/history/${contentId}${query}`);
        if (res.success && res.data?.progressSeconds > 0) {
          if (videoRef.current) {
            // Give 5 seconds grace period before the end to not loop credits
            const targetTime = res.data.progressSeconds;
            if (targetTime > 0) {
              videoRef.current.currentTime = targetTime;
            }
          }
        }
      } catch (err) {
        console.error('Error fetching progress:', err);
      }
    };
    fetchProgress();
  }, [contentId, episodeId]);

  // Save Progress Logic
  const saveProgress = useCallback(async () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration;
    
    if (current === 0 || total === 0 || isNaN(total)) return;
    
    // Solo guardar si avanzamos al menos 10 segundos desde la última vez
    if (Math.abs(current - lastSavedTimeRef.current) < 10) return;
    lastSavedTimeRef.current = current;

    try {
      await apiFetch('/api/history', {
        method: 'POST',
        body: JSON.stringify({
          contentId,
          episodeId,
          progressSeconds: Math.floor(current),
          durationSeconds: Math.floor(total),
        })
      });
    } catch (err) {
      console.error('Error saving progress:', err);
    }
  }, [contentId, episodeId]);

  useEffect(() => {
    const interval = setInterval(saveProgress, 10000);
    return () => {
      clearInterval(interval);
      saveProgress(); // Guardar al desmontar
    };
  }, [saveProgress]);

  // HLS Setup
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        maxBufferLength: 30,
        enableWorker: true,
      });
      hlsRef.current = hls;

      hls.loadSource(url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        // Parse qualities
        const availableQualities = data.levels.map((l, i) => ({ height: l.height, level: i }));
        setQualities(availableQualities.reverse()); // Higher first
        
        // Parse audio
        if (hls.audioTracks && hls.audioTracks.length > 1) {
          setAudioTracks(hls.audioTracks);
        }
        
        setIsLoading(false);
        isReadyRef.current = true;
        video.play().catch(() => { /* Autoplay blocked */ });
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // For Safari
      video.src = url;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        isReadyRef.current = true;
        video.play().catch(() => {});
      });
    }
  }, [url]);

  // Video Events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setProgress((video.currentTime / video.duration) * 100);
    };

    const handleDurationChange = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => setIsLoading(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
      if (!newMuted && volume === 0) {
        setVolume(1);
        videoRef.current.volume = 1;
      }
    }
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen().catch(err => console.error(err));
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * duration;
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return '00:00';
    const h = Math.floor(timeInSeconds / 3600);
    const m = Math.floor((timeInSeconds % 3600) / 60);
    const s = Math.floor(timeInSeconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const changeQuality = (level: number) => {
    setCurrentQuality(level);
    if (hlsRef.current) {
      hlsRef.current.currentLevel = level;
    }
  };

  const changeAudio = (index: number) => {
    setCurrentAudio(index);
    if (hlsRef.current) {
      hlsRef.current.audioTrack = index;
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  // Autohide controls
  const resetControlsTimeout = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !showSettings) setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    document.addEventListener('fullscreenchange', () => {
      setIsFullscreen(!!document.fullscreenElement);
    });
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-screen bg-black flex items-center justify-center overflow-hidden font-sans group"
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        onDoubleClick={() => toggleFullscreen()}
        playsInline
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none z-10">
          <Loader2 className="animate-spin text-[var(--clay-teal)] w-16 h-16" />
        </div>
      )}

      {/* Controls Overlay */}
      <div 
        className={`absolute inset-0 flex flex-col justify-between transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.9) 100%)' }}
      >
        {/* Header */}
        <div className="p-6 flex items-center gap-4 z-20">
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors text-white">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white leading-tight">{title}</h1>
          </div>
        </div>

        {/* Double Tap Areas (Desktop/Mobile overlay for skip) */}
        <div className="absolute inset-0 flex z-10">
          <div className="flex-1" onDoubleClick={() => skip(-10)} />
          <div className="flex-1 flex justify-center items-center" onClick={togglePlay} />
          <div className="flex-1" onDoubleClick={() => skip(10)} />
        </div>

        {/* Bottom Bar */}
        <div className="p-6 z-20 pb-8">
          
          {/* Progress Bar */}
          <div 
            className="w-full h-2 bg-white/30 rounded-full mb-4 cursor-pointer relative group/bar"
            onClick={handleProgressClick}
          >
            <div className="absolute top-0 left-0 h-full bg-[var(--clay-teal)] rounded-full" style={{ width: `${progress}%` }} />
            {/* Thumb */}
            <div 
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover/bar:opacity-100 transition-opacity"
              style={{ left: `calc(${progress}% - 8px)` }}
            />
          </div>

          <div className="flex items-center justify-between">
            {/* Left Controls */}
            <div className="flex items-center gap-4">
              <button onClick={togglePlay} className="text-white hover:text-[var(--clay-teal)] transition-colors">
                {isPlaying ? <Pause size={28} /> : <Play size={28} fill="currentColor" />}
              </button>
              
              <button onClick={() => skip(-10)} className="text-white hover:text-[var(--clay-teal)] transition-colors">
                <SkipBack size={24} />
              </button>
              
              <button onClick={() => skip(10)} className="text-white hover:text-[var(--clay-teal)] transition-colors">
                <SkipForward size={24} />
              </button>

              <div className="flex items-center gap-2 group/vol relative">
                <button onClick={toggleMute} className="text-white hover:text-[var(--clay-teal)] transition-colors">
                  {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>
                <input 
                  type="range" min="0" max="1" step="0.01" 
                  value={isMuted ? 0 : volume} 
                  onChange={handleVolumeChange}
                  className="w-0 opacity-0 group-hover/vol:w-20 group-hover/vol:opacity-100 transition-all duration-300 accent-[var(--clay-teal)]"
                />
              </div>

              <span className="text-white/80 text-sm font-medium tracking-wide font-mono ml-2">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-4 relative">
              <button 
                onClick={() => setShowSettings(!showSettings)} 
                className={`text-white transition-colors ${showSettings ? 'text-[var(--clay-teal)]' : 'hover:text-white/80'}`}
              >
                <Settings size={24} />
              </button>

              <button onClick={toggleFullscreen} className="text-white hover:text-white/80 transition-colors">
                {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
              </button>

              {/* Settings Menu Popup */}
              {showSettings && (
                <div className="absolute bottom-12 right-0 bg-[#121215]/95 backdrop-blur-md border border-white/10 rounded-2xl p-4 w-64 shadow-2xl flex flex-col gap-4">
                  {/* Quality */}
                  {qualities.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-bold text-white/50 uppercase tracking-wider mb-2">Calidad</h4>
                      <div className="flex flex-col gap-1 max-h-32 overflow-y-auto custom-scrollbar">
                        <button 
                          onClick={() => changeQuality(-1)}
                          className={`text-left text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${currentQuality === -1 ? 'bg-[var(--clay-teal)]/20 text-[var(--clay-teal)]' : 'text-white hover:bg-white/10'}`}
                        >
                          Automático
                        </button>
                        {qualities.map((q) => (
                          <button 
                            key={q.level} 
                            onClick={() => changeQuality(q.level)}
                            className={`text-left text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${currentQuality === q.level ? 'bg-[var(--clay-teal)]/20 text-[var(--clay-teal)]' : 'text-white hover:bg-white/10'}`}
                          >
                            {q.height}p {q.height >= 1080 ? 'HD' : ''}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Audio */}
                  {audioTracks.length > 1 && (
                    <div>
                      <h4 className="text-[11px] font-bold text-white/50 uppercase tracking-wider mb-2">Audio</h4>
                      <div className="flex flex-col gap-1">
                        {audioTracks.map((t, i) => (
                          <button 
                            key={i} 
                            onClick={() => changeAudio(i)}
                            className={`text-left text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${currentAudio === i ? 'bg-[var(--clay-teal)]/20 text-[var(--clay-teal)]' : 'text-white hover:bg-white/10'}`}
                          >
                            {t.name || `Pista ${i + 1}`}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
