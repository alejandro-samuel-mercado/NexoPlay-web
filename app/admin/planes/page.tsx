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

  const BoolField = ({ label, field }: { label: string; field: string }) => (
    <label className="flex items-center gap-2 cursor-pointer">
      <div className="relative">
        <input type="checkbox" checked={!!form[field]} onChange={set(field)} className="sr-only peer" />
        <div className="w-10 h-5 rounded-full border-[2px] border-[#3A3A5C] peer-checked:border-[var(--clay-teal)] transition-colors"
          style={{ background: form[field] ? 'var(--clay-teal)' : '#252540' }}>
          <div className="w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-all"
            style={{ left: form[field] ? '1.3rem' : '0.1rem' }} />
        </div>
      </div>
      <span className="text-xs font-semibold text-[#A8B3C8]">{label}</span>
    </label>
  );

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Crown size={24} style={{ color: 'var(--clay-purple)' }} /> Planes de Suscripción
          </h1>
        </div>
        <button onClick={openCreate} className="btn-clay btn-clay-purple flex items-center gap-2">
          <Plus size={16} /> Crear plan
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="clay-skeleton h-48 rounded-[20px]" />)
          : plans.map((plan) => (
            <div key={plan.id} className="clay-card-dark p-6 rounded-[20px] border-[2px] border-[#3A3A5C]"
              style={!plan.isActive ? { opacity: 0.5 } : {}}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-black text-white text-lg">{plan.name}</h3>
                  <p className="text-2xl font-black mt-1" style={{ color: 'var(--clay-teal)' }}>
                    ${Number(plan.price).toFixed(2)}
                    <span className="text-sm font-normal text-[#6B7280]">/{plan.durationDays}d</span>
                  </p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(plan)} className="p-1.5 rounded-[6px] text-[#A8B3C8] hover:bg-white/10">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(plan.id)} className="p-1.5 rounded-[6px] text-[var(--clay-red)] hover:bg-[var(--clay-red)]/10">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-[#A8B3C8]">
                <p>💎 Créditos Totales: <span className="font-bold text-white">{plan.credits}</span></p>
                <p>⬇️ Límite Diario: <span className="font-bold text-white">{plan.dailyLimit} descargas</span></p>
                <p className="pt-2">{plan.canWatch ? '✅' : '❌'} Ver contenido · {plan.canDownload ? '✅' : '❌'} Descargar</p>
                <p>{plan.hasHd ? '✅ HD' : ''} {plan.has4k ? '· ✅ 4K' : ''}</p>
              </div>
            </div>
          ))}
      </div>

      {/* Create/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(15,15,26,0.9)', backdropFilter: 'blur(8px)' }}>
          <div className="clay-card-dark p-8 rounded-[24px] w-full max-w-lg border-[3px] overflow-y-auto max-h-[90vh]"
            style={{ borderColor: 'var(--clay-purple)', boxShadow: '8px 8px 0px var(--clay-purple)' }}>
            <h2 className="text-xl font-black text-white mb-6">
              {modal === 'create' ? 'Crear Plan' : 'Editar Plan'}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-[#A8B3C8] mb-1 block">Nombre *</label>
                <input value={form.name} onChange={set('name')} className="clay-input text-sm" placeholder="ej: Plan Premium" />
              </div>
              <div>
                <label className="text-xs font-bold text-[#A8B3C8] mb-1 block">Precio (USD) *</label>
                <input type="number" value={form.price} onChange={set('price')} className="clay-input text-sm" min={0} step={0.01} />
              </div>
              <div>
                <label className="text-xs font-bold text-[#A8B3C8] mb-1 block">Duración (días) *</label>
                <input type="number" value={form.durationDays} onChange={set('durationDays')} className="clay-input text-sm" min={1} />
              </div>
              <div>
                <label className="text-xs font-bold text-[#A8B3C8] mb-1 block">Créditos Totales (Descargas)</label>
                <input type="number" value={form.credits} onChange={set('credits')} className="clay-input text-sm" min={0} />
              </div>
              <div>
                <label className="text-xs font-bold text-[#A8B3C8] mb-1 block">Límite Diario de Descargas</label>
                <input type="number" value={form.dailyLimit} onChange={set('dailyLimit')} className="clay-input text-sm" min={0} />
              </div>
              <div className="sm:col-span-2 flex flex-wrap gap-4 pt-2">
                <BoolField label="Puede ver contenido" field="canWatch" />
                <BoolField label="Puede descargar" field="canDownload" />
                <BoolField label="HD" field="hasHd" />
                <BoolField label="4K" field="has4k" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(null)} className="btn-clay btn-clay-dark flex-1">Cancelar</button>
              <button onClick={handleSave} disabled={saving || !form.name}
                className="btn-clay btn-clay-purple flex-1 disabled:opacity-60">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
