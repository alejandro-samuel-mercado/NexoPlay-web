'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { Plus, Trash, Play } from 'lucide-react';

export default function AdsDashboard() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'ADMIN') loadCampaigns();
  }, [user]);

  const loadCampaigns = async () => {
    try {
      const res = await apiFetch('/api/ads/campaigns');
      if (res.success) setCampaigns(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addDummyCampaign = async () => {
    try {
      await apiFetch('/api/ads/campaigns', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Banner de Prueba',
          imageUrl: 'https://via.placeholder.com/600x150?text=Tu+Anuncio+Aqui',
          targetUrl: 'https://nexoplay.com',
          type: 'BANNER'
        })
      });
      loadCampaigns();
    } catch (e) {
      console.error(e);
    }
  };

  if (!user || user.role !== 'ADMIN') return <div className="p-8">No autorizado</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Publicidad</h1>
          <p className="text-zinc-400">Administra las campañas visibles para usuarios gratuitos</p>
        </div>
        <button onClick={addDummyCampaign} className="bg-primary text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2">
          <Plus size={20} />
          Crear Campaña
        </button>
      </div>

      {loading ? (
        <div>Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map(c => (
            <div key={c.id} className="bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800">
              <div className="h-32 bg-zinc-800 relative">
                <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 bg-black/50 px-2 py-1 rounded text-xs">
                  {c.type}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">{c.name}</h3>
                <p className="text-zinc-400 text-sm mb-4 truncate">{c.targetUrl}</p>
                <div className="flex justify-between items-center text-sm">
                  <span className={c.isActive ? "text-green-400" : "text-red-400"}>
                    {c.isActive ? 'Activa' : 'Inactiva'}
                  </span>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400"><Trash size={16} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {campaigns.length === 0 && (
            <div className="col-span-full py-12 text-center text-zinc-500 border-2 border-dashed border-zinc-800 rounded-xl">
              No hay campañas de publicidad activas.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
