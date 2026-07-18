'use client';

import { useEffect, useState } from 'react';
import { Crown, Plus, Pencil, Trash2 } from 'lucide-react';
import { API, apiFetch } from '@/lib/api';

const EMPTY_PLAN = {
  name: '', description: '', price: 0, durationDays: 30,
  credits: 50, dailyLimit: 3,
  canWatch: true, canDownload: true, hasHd: true, has4k: false,
};

export default function PlanesAdminPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<null | 'create' | 'edit'>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(EMPTY_PLAN);
  const [saving, setSaving] = useState(false);

  const fetch_ = async () => {
    setLoading(true);
    const res = await apiFetch(API.ADMIN.PLANS);
    if (res.success) setPlans(res.data || []);
    setLoading(false);
  };

  useEffect(() => { fetch_(); }, []);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p: any) => ({ ...p, [k]: e.target.type === 'checkbox' ? (e.target as any).checked : e.target.value }));

  const openCreate = () => { setForm(EMPTY_PLAN); setEditingId(null); setModal('create'); };
  const openEdit = (plan: any) => {
    setForm({ ...plan, price: Number(plan.price) });
    setEditingId(plan.id);
    setModal('edit');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        durationDays: Number(form.durationDays),
        credits: Number(form.credits),
        dailyLimit: Number(form.dailyLimit),
      };
      if (modal === 'create') {
        await apiFetch(API.ADMIN.PLANS, { method: 'POST', body: JSON.stringify(payload) });
      } else {
        await apiFetch(API.ADMIN.PLAN(editingId!), { method: 'PUT', body: JSON.stringify(payload) });
      }
      setModal(null);
      fetch_();
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Desactivar este plan?')) return;
    await apiFetch(API.ADMIN.PLAN(id), { method: 'DELETE' });
    fetch_();
  };

  const BoolField = ({ label, field }: { label: string, field: 'isActive' | 'canWatch' | 'canDownload' | 'hasHd' | 'has4k' }) => (
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
    </label>
  );

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Crown size={28} style={{ color: 'var(--color-secondary)' }} /> Planes de Suscripción
          </h1>
        </div>
        <button onClick={openCreate} className="px-6 py-2.5 rounded-xl font-bold text-sm transition-transform hover:scale-105 active:scale-95 bg-[var(--color-primary)] text-black flex items-center gap-2">
          <Plus size={18} /> Crear plan
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse" />)
          : plans.map((plan) => (
            <div key={plan.id} className="bg-[var(--bg-panel)] backdrop-blur-md border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl transition-all hover:border-[var(--color-primary)]/50"
              style={!plan.isActive ? { opacity: 0.5, filter: 'grayscale(100%)' } : {}}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-black text-white text-xl">{plan.name}</h3>
                  <p className="text-3xl font-black mt-2" style={{ color: 'var(--color-primary)' }}>
                    ${Number(plan.price).toFixed(2)}
                    <span className="text-sm font-bold text-white/50 ml-1">/{plan.durationDays}d</span>
                  </p>
                </div>
                <div className="flex gap-1 bg-black/20 rounded-xl p-1 border border-white/5">
                  <button onClick={() => openEdit(plan)} className="p-2 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => handleDelete(plan.id)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-sm text-white/70">
                <p>Créditos Totales: <span className="font-bold text-white bg-white/5 px-2 py-0.5 rounded-md ml-1 border border-white/10">{plan.credits}</span></p>
                <p>Límite Diario: <span className="font-bold text-white bg-white/5 px-2 py-0.5 rounded-md ml-1 border border-white/10">{plan.dailyLimit} descargas</span></p>
                <div className="pt-3 border-t border-white/10 flex flex-wrap gap-2">
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${plan.canWatch ? 'bg-white/10 text-white' : 'bg-white/5 text-white/40'}`}>{plan.canWatch ? 'Ver contenido' : 'No puede ver'}</span>
                  <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${plan.canDownload ? 'bg-white/10 text-white' : 'bg-white/5 text-white/40'}`}>{plan.canDownload ? 'Descargar' : 'No puede descargar'}</span>
                  {plan.hasHd && <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[var(--color-secondary)]/20 text-[var(--color-secondary)] border border-[var(--color-secondary)]/30">HD</span>}
                  {plan.has4k && <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[var(--color-primary)]/20 text-[var(--color-primary)] border border-[var(--color-primary)]/30">4K</span>}
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Create/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-panel)] p-8 rounded-[24px] w-full max-w-lg border border-[var(--border-subtle)] backdrop-blur-xl shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-black text-white mb-6">
              {modal === 'create' ? 'Crear Plan' : 'Editar Plan'}
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-white/60 mb-2 block uppercase tracking-wider">Nombre *</label>
                <input value={form.name} onChange={set('name')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-colors" placeholder="ej: Plan Premium" />
              </div>
              <div>
                <label className="text-xs font-bold text-white/60 mb-2 block uppercase tracking-wider">Precio (USD) *</label>
                <input type="number" value={form.price} onChange={set('price')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-colors" min={0} step={0.01} />
              </div>
              <div>
                <label className="text-xs font-bold text-white/60 mb-2 block uppercase tracking-wider">Duración (días) *</label>
                <input type="number" value={form.durationDays} onChange={set('durationDays')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-colors" min={1} />
              </div>
              <div>
                <label className="text-xs font-bold text-white/60 mb-2 block uppercase tracking-wider">Créditos Totales (Descargas)</label>
                <input type="number" value={form.credits} onChange={set('credits')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-colors" min={0} />
              </div>
              <div>
                <label className="text-xs font-bold text-white/60 mb-2 block uppercase tracking-wider">Límite Diario de Descargas</label>
                <input type="number" value={form.dailyLimit} onChange={set('dailyLimit')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-colors" min={0} />
              </div>
              <div className="sm:col-span-2 flex flex-wrap gap-4 pt-2">
                <BoolField label="Puede ver contenido" field="canWatch" />
                <BoolField label="Puede descargar" field="canDownload" />
                <BoolField label="HD" field="hasHd" />
                <BoolField label="4K" field="has4k" />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setModal(null)} className="px-4 py-3 rounded-xl font-bold text-sm bg-white/10 text-white hover:bg-white/20 transition-colors flex-1">Cancelar</button>
              <button onClick={handleSave} disabled={saving || !form.name}
                className="px-4 py-3 rounded-xl font-bold text-sm bg-[var(--color-primary)] text-black hover:scale-105 transition-transform flex-1 disabled:opacity-50 disabled:hover:scale-100">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
