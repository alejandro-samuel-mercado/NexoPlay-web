'use client';

import { useEffect, useState } from 'react';
import { API, apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { TrendingUp, Plus, Eye, MousePointer, Activity } from 'lucide-react';

export default function AdminAdsPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ name: '', imageUrl: '', targetUrl: '', type: 'BANNER' });

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/');
    if (isAdmin) fetchCampaigns();
  }, [isAdmin, authLoading]);

  const fetchCampaigns = () => {
    setLoading(true);
    API.ADS.admin.stats().then((res) => {
      if (res.success) setCampaigns(res.data);
    }).catch(console.error).finally(() => setLoading(false));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.ADS.admin.create(formData);
      setIsCreating(false);
      setFormData({ name: '', imageUrl: '', targetUrl: '', type: 'BANNER' });
      fetchCampaigns();
    } catch (e: any) {
      alert(e.message || 'Error creating campaign');
    }
  };

  if (authLoading || loading) return <div className="p-8"><div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--clay-teal)' }} /></div>;

  return (
    <div className="p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <TrendingUp className="text-[var(--clay-teal)]" size={32} />
            Publicidad (Ads)
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">Gestiona las campañas para usuarios gratuitos</p>
        </div>
        <button onClick={() => setIsCreating(true)} className="btn-clay flex items-center gap-2">
          <Plus size={18} /> Nueva Campaña
        </button>
      </div>

      {isCreating && (
        <div className="clay-card-dark p-6 rounded-[20px] mb-8 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Crear Campaña</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Nombre</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">URL de la Imagen (Banner)</label>
              <input type="url" required value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">URL de Destino</label>
              <input type="url" required value={formData.targetUrl} onChange={e => setFormData({ ...formData, targetUrl: e.target.value })} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" />
            </div>
            <div className="flex gap-4 pt-2">
              <button type="submit" className="bg-[var(--clay-teal)] text-black px-6 py-2 rounded font-bold hover:brightness-110">Guardar</button>
              <button type="button" onClick={() => setIsCreating(false)} className="border border-gray-600 text-gray-300 px-6 py-2 rounded font-bold hover:text-white">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {campaigns.map(c => (
          <div key={c.id} className="clay-card-dark p-5 rounded-[20px] border border-gray-800 flex flex-col">
            <div className="relative w-full h-32 bg-gray-900 rounded-lg overflow-hidden mb-4">
              <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                {c.isActive ? 'Activa' : 'Inactiva'}
              </div>
            </div>
            <h3 className="font-bold text-white text-lg mb-1">{c.name}</h3>
            <p className="text-xs text-gray-400 mb-4 line-clamp-1">{c.targetUrl}</p>
            
            <div className="grid grid-cols-3 gap-2 mt-auto pt-4 border-t border-gray-800">
              <div className="flex flex-col items-center">
                <Eye size={16} className="text-gray-500 mb-1" />
                <span className="text-white font-bold">{c.impressionsCount}</span>
                <span className="text-[10px] text-gray-500 uppercase">Impresiones</span>
              </div>
              <div className="flex flex-col items-center">
                <MousePointer size={16} className="text-[var(--clay-teal)] mb-1" />
                <span className="text-white font-bold">{c.clicksCount}</span>
                <span className="text-[10px] text-gray-500 uppercase">Clics</span>
              </div>
              <div className="flex flex-col items-center">
                <Activity size={16} className="text-[var(--clay-yellow)] mb-1" />
                <span className="text-white font-bold">{c.ctr}%</span>
                <span className="text-[10px] text-gray-500 uppercase">CTR</span>
              </div>
            </div>
          </div>
        ))}
        {campaigns.length === 0 && !isCreating && (
          <div className="col-span-full text-center text-gray-500 py-12">
            No hay campañas publicitarias creadas.
          </div>
        )}
      </div>
    </div>
  );
}
