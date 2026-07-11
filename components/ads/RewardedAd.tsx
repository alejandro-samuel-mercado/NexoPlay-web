'use client';

import { useState } from 'react';
import { API } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Coins, Play, X } from 'lucide-react';

export default function RewardedAd() {
  const { user, isSubscriber, isLoading } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [rewarded, setRewarded] = useState(false);

  // Only show for non-subscribers logged in
  if (isLoading || isSubscriber || !user) return null;

  const handleStartAd = () => {
    setIsPlaying(true);
    setProgress(0);
    setRewarded(false);

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 100 / 15; // 15 seconds
      if (currentProgress >= 100) {
        clearInterval(interval);
        setProgress(100);
        grantReward();
      } else {
        setProgress(currentProgress);
      }
    }, 1000);
  };

  const grantReward = async () => {
    try {
      const res = await API.ADS.reward({ campaignId: 'rewarded-default' });
      if (res.success) {
        setRewarded(true);
        alert(`¡Felicidades! Has ganado ${res.rewardedTokens} Tokens.`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <div className="w-full max-w-4xl mx-auto mb-6 px-4">
        <div 
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-gray-900 to-gray-800 border border-[var(--clay-yellow)]/30 rounded-lg p-4 flex items-center justify-between cursor-pointer hover:border-[var(--clay-yellow)] transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--clay-yellow)]/20 flex items-center justify-center">
              <Play className="text-[var(--clay-yellow)]" size={20} />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Gana 5 Tokens Gratis</p>
              <p className="text-xs text-gray-400">Mira un breve anuncio de 15 segundos</p>
            </div>
          </div>
          <Coins className="text-[var(--clay-yellow)]" size={24} />
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md overflow-hidden relative">
            {!isPlaying && !rewarded && (
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            )}

            <div className="p-8 text-center">
              {!isPlaying && !rewarded ? (
                <>
                  <Coins className="text-[var(--clay-yellow)] mx-auto mb-4" size={48} />
                  <h2 className="text-2xl font-black text-white mb-2">Anuncio Patrocinado</h2>
                  <p className="text-sm text-gray-400 mb-6">Apoya a la plataforma viendo este video y llévate 5 tokens para canjear por películas.</p>
                  <button 
                    onClick={handleStartAd}
                    className="w-full bg-[var(--clay-yellow)] text-black font-black py-3 rounded-xl hover:brightness-110 flex justify-center items-center gap-2"
                  >
                    <Play size={20} /> Empezar a ver (15s)
                  </button>
                </>
              ) : isPlaying && !rewarded ? (
                <>
                  <div className="aspect-video bg-black rounded-lg flex items-center justify-center mb-6 relative overflow-hidden border border-gray-800">
                    <span className="text-gray-500 font-bold tracking-widest">VIDEO PUBLICITARIO</span>
                    <div className="absolute bottom-0 left-0 h-1 bg-[var(--clay-yellow)] transition-all duration-1000 ease-linear" style={{ width: `${progress}%` }} />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">Reproduciendo...</h2>
                  <p className="text-sm text-gray-400">Por favor, no cierres esta ventana.</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center mx-auto mb-4">
                    <Coins size={32} />
                  </div>
                  <h2 className="text-2xl font-black text-white mb-2">¡Misión Cumplida!</h2>
                  <p className="text-sm text-gray-400 mb-6">Los 5 tokens han sido agregados a tu billetera.</p>
                  <button 
                    onClick={() => {
                      setShowModal(false);
                      window.location.reload(); // Reload to update wallet in navbar
                    }}
                    className="w-full bg-white text-black font-black py-3 rounded-xl hover:brightness-90"
                  >
                    Cerrar y ver mi saldo
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
