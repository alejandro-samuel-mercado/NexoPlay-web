'use client';
import React from 'react';
import { X, Check } from 'lucide-react';

export interface AudioTrack {
  language: string;
  label: string;
  isDefault?: boolean;
}

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  audioTracks: AudioTrack[];
  onSelect: (language: string) => void;
}

const formatLanguage = (lang: string, label: string) => {
  const map: Record<string, string> = {
    'es': 'Español', 'spa': 'Español',
    'en': 'Inglés', 'eng': 'Inglés',
    'pt': 'Portugués', 'por': 'Portugués',
    'fr': 'Francés', 'fra': 'Francés',
    'it': 'Italiano', 'ita': 'Italiano',
    'de': 'Alemán', 'deu': 'Alemán',
    'ja': 'Japonés', 'jpn': 'Japonés',
    'ko': 'Coreano', 'kor': 'Coreano',
  };
  
  const mappedLang = map[lang?.toLowerCase()] || lang?.toUpperCase() || 'Unknown';
  if (label && label.toLowerCase() !== lang?.toLowerCase()) {
    // Si el label es un texto genérico como "Audio 1" o distinto al código
    return `${mappedLang} (${label})`;
  }
  return mappedLang;
};

export default function LanguageSelectorModal({ isOpen, onClose, audioTracks, onSelect }: LanguageSelectorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div className="modal-container modal-type-info max-w-md w-full" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>
        <div className="modal-header pb-4 border-b border-white/10">
          <h2 className="modal-title m-0 text-xl font-bold text-white">Selecciona el Idioma</h2>
        </div>
        <div className="modal-body p-0 max-h-[60vh] overflow-y-auto">
          {audioTracks.map((track, idx) => (
            <button
              key={idx}
              className="w-full flex items-center justify-between p-4 border-b border-white/10 hover:bg-white/5 transition-colors text-left"
              onClick={() => {
                onSelect(track.language);
                onClose();
              }}
            >
              <div className="flex items-center gap-3">
                <span className="text-white font-medium text-lg">
                  {formatLanguage(track.language, track.label)}
                </span>
                {track.isDefault && (
                  <span className="bg-[var(--primary)] text-white text-[10px] font-bold px-2 py-1 rounded-md">
                    Recomendado
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
