'use client';

import { useState, useEffect } from 'react';
import { Package, Plus, Trash2, Edit2, Check, X, Box } from 'lucide-react';
import { API, apiFetch } from '@/lib/api';

interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  priceUSD: string;
  isActive: boolean;
  sortOrder: number;
}

export default function ResellerCreditPacksPage() {
  const [packages, setPackages] = useState<TokenPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', tokens: '', priceUSD: '', sortOrder: '0' });

  useEffect(() => {
    apiFetch(API.RESELLER.CREDIT_PACKS.LIST)
      .then(res => { if (res.success) setPackages(res.data || []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSavePackage = async () => {
    try {
      const data = {
        name: form.name,
        tokens: Number(form.tokens),
        priceUSD: Number(form.priceUSD),
        sortOrder: Number(form.sortOrder),
      };
      if (editId) {
        const res = await apiFetch(API.RESELLER.CREDIT_PACKS.PACKAGE(editId), { method: 'PUT', body: JSON.stringify(data) });
        if (res.success) setPackages(prev => prev.map(p => p.id === editId ? res.data : p));
      } else {
        const res = await apiFetch(API.RESELLER.CREDIT_PACKS.LIST, { method: 'POST', body: JSON.stringify(data) });
        if (res.success) setPackages(prev => [...prev, res.data]);
      }
      setShowForm(false);
      setEditId(null);
      setForm({ name: '', tokens: '', priceUSD: '', sortOrder: '0' });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este paquete?')) return;
    await apiFetch(API.RESELLER.CREDIT_PACKS.PACKAGE(id), { method: 'DELETE' });
    setPackages(prev => prev.filter(p => p.id !== id));
  };

  const handleToggleActive = async (pkg: TokenPackage) => {
    const res = await apiFetch(API.RESELLER.CREDIT_PACKS.PACKAGE(pkg.id), {
      method: 'PUT', body: JSON.stringify({ isActive: !pkg.isActive }),
    });
    if (res.success) setPackages(prev => prev.map(p => p.id === pkg.id ? res.data : p));
  };

  return (
    <div className="p-6 sm:p-8 max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <Package size={28} style={{ color: 'var(--clay-yellow)' }} />
          Packs de Créditos
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Creá y administrá los paquetes de créditos para vender a tus revendedores.</p>
      </div>

      {/* Packages list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-white flex items-center gap-2">
            <Box size={18} style={{ color: 'var(--clay-yellow)' }} />
            Mis Paquetes
          </h2>
          <button onClick={() => { setShowForm(true); setEditId(null); setForm({ name: '', tokens: '', priceUSD: '', sortOrder: '0' }); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black"
            style={{ background: 'var(--clay-yellow)', color: 'var(--clay-ink)', border: '2px solid var(--clay-ink)', boxShadow: '2px 2px 0 var(--clay-ink)' }}>
            <Plus size={14} /> Nuevo paquete
          </button>
        </div>

        {/* Create / Edit form */}
        {showForm && (
          <div className="mb-4 p-4 rounded-2xl border-2" style={{ borderColor: 'var(--clay-yellow)', background: 'rgba(255,210,63,0.06)' }}>
            <div className="grid sm:grid-cols-4 gap-3 mb-3">
              <input placeholder="Nombre (ej. Popular)" value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="px-3 py-2 rounded-xl text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)' }} />
              <input type="number" placeholder="Cantidad de Créditos" value={form.tokens}
                onChange={e => setForm(p => ({ ...p, tokens: e.target.value }))}
                className="px-3 py-2 rounded-xl text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)' }} />
              <input type="number" step="0.01" placeholder="Precio ($)" value={form.priceUSD}
                onChange={e => setForm(p => ({ ...p, priceUSD: e.target.value }))}
                className="px-3 py-2 rounded-xl text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)' }} />
              <input type="number" placeholder="Orden (ej. 1)" value={form.sortOrder}
                onChange={e => setForm(p => ({ ...p, sortOrder: e.target.value }))}
                className="px-3 py-2 rounded-xl text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)' }} />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm font-bold text-white/70 hover:text-white">Cancelar</button>
              <button onClick={handleSavePackage} className="px-4 py-2 rounded-xl text-sm font-bold bg-white/10 hover:bg-white/20 text-white">Guardar</button>
            </div>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-white/50">Cargando paquetes...</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {packages.map(pkg => (
              <div key={pkg.id} className={`p-4 rounded-2xl border-2 relative transition-all ${pkg.isActive ? 'border-white/10 bg-white/5' : 'border-white/5 bg-transparent opacity-50'}`}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-black text-lg text-white">{pkg.name}</h3>
                  <div className="flex gap-1">
                    <button onClick={() => handleToggleActive(pkg)} className="p-1.5 rounded-lg hover:bg-white/10">
                      {pkg.isActive ? <Check size={16} className="text-green-400" /> : <X size={16} className="text-red-400" />}
                    </button>
                    <button onClick={() => { setEditId(pkg.id); setForm({ name: pkg.name, tokens: String(pkg.tokens), priceUSD: String(pkg.priceUSD), sortOrder: String(pkg.sortOrder) }); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-white/10">
                      <Edit2 size={16} className="text-white/60" />
                    </button>
                    <button onClick={() => handleDelete(pkg.id)} className="p-1.5 rounded-lg hover:bg-white/10 text-red-400">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm mt-4">
                  <div className="flex items-center gap-1 font-bold" style={{ color: 'var(--clay-yellow)' }}>
                    <Package size={14} /> {pkg.tokens} Créditos
                  </div>
                  <div className="font-bold text-white/80">${pkg.priceUSD} USD</div>
                </div>
              </div>
            ))}
            {packages.length === 0 && !showForm && (
              <div className="col-span-full p-8 text-center rounded-2xl border-2 border-dashed border-white/10">
                <p className="text-sm text-white/50 mb-4">No tienes ningún paquete de créditos creado.</p>
                <button onClick={() => { setShowForm(true); setEditId(null); setForm({ name: '', tokens: '', priceUSD: '', sortOrder: '0' }); }} className="px-4 py-2 rounded-xl text-sm font-bold bg-white/10 hover:bg-white/20 text-white">
                  Crear mi primer paquete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
