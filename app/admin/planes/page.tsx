'use client';

import { useEffect, useState } from 'react';
import { Crown, Pencil, X } from 'lucide-react';
import { API, apiFetch } from '@/lib/api';

const EMPTY_PLAN = {
  id: '', name: '', description: '', role: '', tier: '',
  tokenCost: 0, weeklyOfflineLimit: 0, dailyDownloadLimit: 0,
  unlimitedDownloads: false, showAds: false, isActive: true,
};

export default function PlanesAdminPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<null | 'edit'>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(EMPTY_PLAN);
  const [saving, setSaving] = useState(false);

  const fetch_ = async () => {
    setLoading(true);
    const res = await apiFetch(API.ADMIN.SUBSCRIPTIONS);
    if (res.success) setPlans(res.data || []);
    setLoading(false);
  };

  useEffect(() => { fetch_(); }, []);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p: any) => ({ ...p, [k]: e.target.type === 'checkbox' ? (e.target as any).checked : e.target.value }));

  const openEdit = (plan: any) => {
    setForm({ ...plan, tokenCost: Number(plan.tokenCost) });
    setEditingId(plan.id);
    setModal('edit');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        tokenCost: Number(form.tokenCost),
        weeklyOfflineLimit: Number(form.weeklyOfflineLimit),
        dailyDownloadLimit: Number(form.dailyDownloadLimit),
        unlimitedDownloads: !!form.unlimitedDownloads,
        showAds: !!form.showAds,
        isActive: !!form.isActive,
      };
      
      await apiFetch(API.ADMIN.SUBSCRIPTION(editingId!), { method: 'PATCH', body: JSON.stringify(payload) });
      
      setModal(null);
      fetch_();
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  };

  const BoolField = ({ label, field }: { label: string, field: string }) => (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative flex items-center">
        <input type="checkbox" checked={!!form[field]} onChange={set(field)} className="sr-only peer" />
        <div className="w-10 h-5 rounded-full border border-white/20 peer-checked:border-[var(--color-primary)] transition-colors"
          style={{ background: form[field] ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)' }}>
          <div className="w-3.5 h-3.5 rounded-full bg-white absolute top-[2px] transition-all shadow-sm"
            style={{ left: form[field] ? '1.3rem' : '0.1rem' }} />
        </div>
      </div>
      <span className="text-sm font-bold text-white/70 group-hover:text-white transition-colors">{label}</span>
      <span className="text-sm font-bold text-white/70 group-hover:text-white transition-colors">{label}</span>
    </label>
  );

  const renderPlan = (plan: any) => (
    <div key={plan.id} className="bg-[var(--bg-panel)] backdrop-blur-md border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl transition-all hover:border-[var(--color-primary)]/50"
      style={!plan.isActive ? { opacity: 0.5, filter: 'grayscale(100%)' } : {}}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-black text-white text-xl">{plan.name}</h3>
          <p className="text-sm text-white/50">{plan.role} - {plan.tier}</p>
          <p className="text-3xl font-black mt-2" style={{ color: 'var(--color-primary)' }}>
            {Number(plan.tokenCost)} <span className="text-sm font-bold text-white/50">Tokens</span>
          </p>
        </div>
        <div className="flex gap-1 bg-black/20 rounded-xl p-1 border border-white/5">
          <button onClick={() => openEdit(plan)} className="p-2 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors">
            <Pencil size={16} />
          </button>
        </div>
      </div>
      <div className="space-y-2 text-sm text-white/70">
        <p>Offline: <span className="font-bold text-white bg-white/5 px-2 py-0.5 rounded-md ml-1 border border-white/10">{plan.weeklyOfflineLimit} / sem</span></p>
        <p>Descargas (B2B): <span className="font-bold text-white bg-white/5 px-2 py-0.5 rounded-md ml-1 border border-white/10">{plan.unlimitedDownloads ? 'Ilimitadas' : `${plan.dailyDownloadLimit} / día`}</span></p>
        <div className="pt-3 border-t border-white/10 flex flex-wrap gap-2">
          <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${!plan.showAds ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{plan.showAds ? 'Con Publicidad' : 'Sin Publicidad'}</span>
          {!plan.isActive && <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30">Inactivo</span>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Crown size={28} style={{ color: 'var(--color-secondary)' }} /> Planes de Suscripción
          </h1>
          <p className="text-sm text-white/50 mt-2">Gestiona las propiedades de los 4 planes base del sistema.</p>
        </div>
      </div>

      {/* Plans Display */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-64 bg-white/5 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-12">
          {/* Planes B2C */}
          <div>
            <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-3 flex items-center gap-2">
               Planes de Usuario Final (B2C)
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
              {plans.filter(p => p.role === 'SUBSCRIBER').map(renderPlan)}
            </div>
          </div>
          
          {/* Planes B2B */}
          <div>
            <h2 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-3 flex items-center gap-2">
               Planes para Revendedores (B2B)
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
              {plans.filter(p => p.role === 'RESELLER').map(renderPlan)}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-panel)] p-8 rounded-[24px] w-full max-w-lg border border-[var(--border-subtle)] backdrop-blur-xl shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-white">Editar Plan</h3>
                <button onClick={() => setModal(null)} className="text-white/40 hover:text-white"><X size={24} /></button>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 flex items-center gap-2 bg-white/5 p-3 rounded-xl border border-white/10">
                  <span className="text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/20 px-2 py-1 rounded-md">{form.role}</span>
                  <span className="text-xs font-bold text-white/50 px-2 py-1 bg-white/10 rounded-md border border-white/5">{form.tier}</span>
              </div>
              
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-white/60 mb-2 block uppercase tracking-wider">Nombre</label>
                <input value={form.name} onChange={set('name')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[var(--color-primary)] outline-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-white/60 mb-2 block uppercase tracking-wider">Descripción</label>
                <textarea value={form.description} onChange={set('description')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[var(--color-primary)] outline-none" rows={2} />
              </div>
              <div>
                <label className="text-xs font-bold text-white/60 mb-2 block uppercase tracking-wider">Costo (Tokens)</label>
                <input type="number" value={form.tokenCost} onChange={set('tokenCost')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[var(--color-primary)] outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-white/60 mb-2 block uppercase tracking-wider">Offline por Sem.</label>
                <input type="number" value={form.weeklyOfflineLimit} onChange={set('weeklyOfflineLimit')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[var(--color-primary)] outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-white/60 mb-2 block uppercase tracking-wider">Descargas B2B Día</label>
                <input type="number" value={form.dailyDownloadLimit} onChange={set('dailyDownloadLimit')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[var(--color-primary)] outline-none" disabled={form.unlimitedDownloads} />
              </div>

              <div className="sm:col-span-2 grid sm:grid-cols-2 gap-4 mt-2">
                <BoolField label="Plan Activo" field="isActive" />
                <BoolField label="Mostrar Anuncios" field="showAds" />
                {form.role === 'RESELLER' && <BoolField label="Descargas Ilimitadas" field="unlimitedDownloads" />}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setModal(null)} className="px-6 py-2.5 rounded-xl font-bold text-sm text-white/70 hover:bg-white/5 transition-colors">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 rounded-xl font-bold text-sm bg-[var(--color-primary)] text-black transition-transform hover:scale-105 active:scale-95 disabled:opacity-50">
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
