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

  if (authLoading || loading) return <div className="p-8 flex justify-center"><div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} /></div>;

  return (
    <div className="p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <TrendingUp style={{ color: 'var(--color-secondary)' }} size={28} />
            Publicidad (Ads)
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Gestiona las campañas para usuarios gratuitos</p>
        </div>
        <button onClick={() => setIsCreating(true)} className="px-6 py-2.5 rounded-xl font-bold text-sm transition-transform hover:scale-105 active:scale-95 bg-[var(--color-primary)] text-black flex items-center gap-2">
          <Plus size={18} /> Nueva Campaña
        </button>
      </div>

      {isCreating && (
        <div className="bg-[var(--bg-panel)] backdrop-blur-md border border-[var(--border-subtle)] p-6 rounded-2xl mb-8 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-4">Crear Campaña</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-white/60 mb-2 block uppercase tracking-wider">Nombre</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors" />
            </div>
            <div>
              <label className="text-xs font-bold text-white/60 mb-2 block uppercase tracking-wider">URL de la Imagen (Banner)</label>
              <input type="url" required value={formData.imageUrl} onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors" />
            </div>
            <div>
              <label className="text-xs font-bold text-white/60 mb-2 block uppercase tracking-wider">URL de Destino</label>
              <input type="url" required value={formData.targetUrl} onChange={e => setFormData({ ...formData, targetUrl: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors" />
            </div>
            <div className="flex gap-4 pt-4">
              <button type="submit" className="px-6 py-3 rounded-xl font-bold text-sm bg-[var(--color-primary)] text-black hover:scale-105 transition-transform">Guardar</button>
              <button type="button" onClick={() => setIsCreating(false)} className="px-6 py-3 rounded-xl font-bold text-sm bg-white/10 text-white hover:bg-white/20 transition-colors">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {campaigns.map(c => (
          <div key={c.id} className="bg-[var(--bg-panel)] backdrop-blur-md border border-[var(--border-subtle)] p-5 rounded-2xl flex flex-col shadow-xl hover:border-[var(--color-primary)]/50 transition-all">
            <div className="relative w-full h-32 bg-white/5 rounded-xl overflow-hidden mb-4 border border-white/10">
              <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 bg-black/70 px-2.5 py-1 rounded-md text-xs font-bold text-white border border-white/20 backdrop-blur-sm">
                {c.isActive ? 'Activa' : 'Inactiva'}
              </div>
            </div>
            <h3 className="font-bold text-white text-lg mb-1">{c.name}</h3>
            <p className="text-xs text-white/50 mb-4 line-clamp-1">{c.targetUrl}</p>
            
            <div className="grid grid-cols-3 gap-2 mt-auto pt-4 border-t border-white/10">
              <div className="flex flex-col items-center">
                <Eye size={18} className="text-white/40 mb-1" />
                <span className="text-white font-bold">{c.impressionsCount}</span>
                <span className="text-[10px] text-white/40 uppercase tracking-wider">Impresiones</span>
              </div>
              <div className="flex flex-col items-center">
                <MousePointer size={18} className="text-[var(--color-primary)] mb-1" />
                <span className="text-white font-bold">{c.clicksCount}</span>
                <span className="text-[10px] text-white/40 uppercase tracking-wider">Clics</span>
              </div>
              <div className="flex flex-col items-center">
                <Activity size={18} className="text-[var(--color-secondary)] mb-1" />
                <span className="text-white font-bold">{c.ctr}%</span>
                <span className="text-[10px] text-white/40 uppercase tracking-wider">CTR</span>
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
