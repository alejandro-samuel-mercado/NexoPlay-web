'use client';

import { useEffect, useState } from 'react';
import { API } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Campaign {
  id: string;
  imageUrl: string;
  targetUrl: string;
}

export default function AdBanner() {
  const { user, showAds, isLoading } = useAuth();
  const [ad, setAd] = useState<Campaign | null>(null);

  useEffect(() => {
    // Only show ads for non-subscribers
    if (isLoading || !showAds) return;

    // Fetch active ads
    API.ADS.active().then((res) => {
      if (res.success && res.data.length > 0) {
        // Pick a random ad
        const randomAd = res.data[Math.floor(Math.random() * res.data.length)];
        setAd(randomAd);
        
        // Record impression
        API.ADS.impression({
          campaignId: randomAd.id,
          userId: user?.id,
          deviceType: window.innerWidth < 768 ? 'MOBILE' : 'DESKTOP'
        }).catch(console.error);
      }
    }).catch(console.error);
  }, [isLoading, showAds, user]);

  if (!ad) return null;

  const handleClick = () => {
    // Record click
    API.ADS.click({
      campaignId: ad.id,
      userId: user?.id,
    }).catch(console.error);
    
    // Open target url
    window.open(ad.targetUrl, '_blank');
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-6 px-4 cursor-pointer" onClick={handleClick}>
      <div className="relative rounded-lg overflow-hidden border border-gray-800 hover:border-gray-600 transition-colors">
        <span className="absolute top-1 right-2 text-[10px] bg-black/50 px-2 rounded-full text-gray-400">Anuncio</span>
        <img src={ad.imageUrl} alt="Advertisement" className="w-full h-auto max-h-[150px] object-cover" />
      </div>
    </div>
  );
}
