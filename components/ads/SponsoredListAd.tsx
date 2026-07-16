'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ExternalLink } from 'lucide-react';
import { API, apiFetch } from '@/lib/api';

export default function SponsoredListAd() {
  const { isSubscriber, isLoading } = useAuth();
  const [ad, setAd] = useState<any>(null);

  useEffect(() => {
    if (!isLoading && !isSubscriber) {
      // Fetch a sponsored list ad (could just reuse the display ad logic or a specific sponsored list)
      // For MVP, we simulate a sponsored list ad block that matches the UI of a content carousel
        const fetchAd = async () => {
        try {
          const res = await API.ADS.active();
          if (res.success && res.data) {
            setAd(res.data);
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchAd();
    }
  }, [isLoading, isSubscriber]);

  if (isLoading || isSubscriber || !ad) return null;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 mb-10">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl md:text-2xl font-black text-white">Top 10 Sugerencias</h2>
        <span className="bg-gray-800 text-gray-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-gray-700">Patrocinado</span>
      </div>
      
      <a 
        href={ad.targetUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        onClick={() => API.ADS.click({ campaignId: ad.id }).catch(()=>null)}
        className="block relative rounded-2xl overflow-hidden group border-2 border-gray-800 hover:border-[var(--clay-teal)] transition-all cursor-pointer"
      >
        {/* We use an aspect ratio similar to a banner but shaped like a content row */}
        <div className="w-full h-[200px] md:h-[250px] relative">
          <img src={ad.imageUrl} alt={ad.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
          
          <div className="absolute bottom-6 left-6 max-w-lg">
            <span className="bg-[var(--clay-teal)] text-black text-xs font-bold px-2 py-1 rounded mb-2 inline-block">Recomendado por {ad.name}</span>
            <h3 className="text-2xl font-black text-white mb-2 leading-tight">Descubre más contenido exclusivo de nuestro patrocinador</h3>
            <p className="text-sm text-gray-300 hidden md:block">Haz clic aquí para visitar el sitio y conocer más detalles sobre las ofertas de hoy.</p>
          </div>

          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md rounded-full p-2 text-white/50 group-hover:text-white transition-colors border border-white/10">
            <ExternalLink size={20} />
          </div>
        </div>
      </a>
    </div>
  );
}
