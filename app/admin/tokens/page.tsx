'use client';

import { useState, useEffect } from 'react';
import { Coins, Plus, Trash2, Edit2, Check, X, Zap, Gift } from 'lucide-react';
import { API, apiFetch } from '@/lib/api';

interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  priceUSD: string;
  isActive: boolean;
  sortOrder: number;
}

export default function AdminTokensPage() {
  const [packages, setPackages] = useState<TokenPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', tokens: '', priceUSD: '', sortOrder: '0' });

  // Grant form
  const [grantForm, setGrantForm] = useState({ userId: '', amount: '', reason: '' });
  const [grantLoading, setGrantLoading] = useState(false);
  const [grantMsg, setGrantMsg] = useState('');

  useEffect(() => {
    apiFetch(API.TOKENS.PACKAGES)
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
        const res = await apiFetch(API.TOKENS.ADMIN_PACKAGE(editId), { method: 'PATCH', body: JSON.stringify(data) });
        if (res.success) setPackages(prev => prev.map(p => p.id === editId ? res.data : p));
      } else {
        const res = await apiFetch(API.TOKENS.ADMIN_PACKAGES, { method: 'POST', body: JSON.stringify(data) });
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
    await apiFetch(API.TOKENS.ADMIN_PACKAGE(id), { method: 'DELETE' });
    setPackages(prev => prev.filter(p => p.id !== id));
  };

  const handleToggleActive = async (pkg: TokenPackage) => {
    const res = await apiFetch(API.TOKENS.ADMIN_PACKAGE(pkg.id), {
      method: 'PATCH', body: JSON.stringify({ isActive: !pkg.isActive }),
    });
    if (res.success) setPackages(prev => prev.map(p => p.id === pkg.id ? res.data : p));
  };

  const handleGrant = async () => {
    if (!grantForm.userId || !grantForm.amount) return;
    setGrantLoading(true);
    setGrantMsg('');
    try {
      const res = await apiFetch(API.TOKENS.ADMIN_GRANT, {
        method: 'POST',
        body: JSON.stringify({ userId: grantForm.userId, amount: Number(grantForm.amount), reason: grantForm.reason }),
      });
      if (res.success) {
        setGrantMsg(`✅ Emitidos ${grantForm.amount} tokens. Nuevo saldo: ${res.data.balance}`);
        setGrantForm({ userId: '', amount: '', reason: '' });
      }
    } catch (err: any) {
      setGrantMsg(`❌ ${err.message}`);
    } finally {
      setGrantLoading(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <Coins size={28} style={{ color: 'var(--clay-yellow)' }} />
          Gestión de Tokens
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Administrá los paquetes disponibles y emití tokens manualmente</p>
      </div>

      {/* Emit tokens manually */}
      <div className="p-5 rounded-2xl border-2" style={{ borderColor: 'var(--clay-mint)', background: 'rgba(0,255,180,0.04)', boxShadow: '3px 3px 0 var(--clay-mint)' }}>
        <h2 className="font-black text-white flex items-center gap-2 mb-4">
          <Gift size={18} style={{ color: 'var(--clay-mint)' }} />
          Emitir Tokens Manualmente
        </h2>
        <div className="grid sm:grid-cols-3 gap-3 mb-3">
          <input placeholder="ID o email del usuario" value={grantForm.userId}
            onChange={e => setGrantForm(p => ({ ...p, userId: e.target.value }))}
            className="px-3 py-2 rounded-xl text-sm text-white outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)' }} />
          <input type="number" placeholder="Cantidad" value={grantForm.amount}
            onChange={e => setGrantForm(p => ({ ...p, amount: e.target.value }))}
            className="px-3 py-2 rounded-xl text-sm text-white outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)' }} />
          <input placeholder="Motivo (opcional)" value={grantForm.reason}
            onChange={e => setGrantForm(p => ({ ...p, reason: e.target.value }))}
            className="px-3 py-2 rounded-xl text-sm text-white outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)' }} />
        </div>
        <button onClick={handleGrant} disabled={grantLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all disabled:opacity-60"
          style={{ background: 'var(--clay-mint)', color: 'var(--clay-ink)', border: '2px solid var(--clay-ink)', boxShadow: '2px 2px 0 var(--clay-ink)' }}>
          <Zap size={14} />
          {grantLoading ? 'Emitiendo...' : 'Emitir tokens'}
        </button>
        {grantMsg && <p className="text-sm mt-3 font-medium" style={{ color: grantMsg.startsWith('✅') ? 'var(--clay-mint)' : '#ff5050' }}>{grantMsg}</p>}
      </div>

      {/* Packages list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-white flex items-center gap-2">
            <Coins size={18} style={{ color: 'var(--clay-yellow)' }} />
            Paquetes de Tokens
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
              <input type="number" placeholder="Tokens (ej. 270)" value={form.tokens}
                onChange={e => setForm(p => ({ ...p, tokens: e.target.value }))}
                className="px-3 py-2 rounded-xl text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)' }} />
              <input type="number" placeholder="Precio USD" value={form.priceUSD}
                onChange={e => setForm(p => ({ ...p, priceUSD: e.target.value }))}
                className="px-3 py-2 rounded-xl text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)' }} />
              <input type="number" placeholder="Orden" value={form.sortOrder}
                onChange={e => setForm(p => ({ ...p, sortOrder: e.target.value }))}
                className="px-3 py-2 rounded-xl text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)' }} />
            </div>
            <div className="flex gap-2">
              <button onClick={handleSavePackage}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black"
                style={{ background: 'var(--clay-teal)', color: 'var(--clay-ink)', border: '2px solid var(--clay-ink)' }}>
                <Check size={12} /> Guardar
              </button>
              <button onClick={() => { setShowForm(false); setEditId(null); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
                style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-muted)', border: '2px solid rgba(255,255,255,0.1)' }}>
                <X size={12} /> Cancelar
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="clay-skeleton h-16 rounded-xl" />)}</div>
        ) : packages.length === 0 ? (
          <p className="text-center py-10 text-sm" style={{ color: 'var(--text-muted)' }}>No hay paquetes creados. Creá el primero.</p>
        ) : (
          <div className="space-y-3">
            {packages.map(pkg => (
              <div key={pkg.id} className="flex items-center justify-between p-4 rounded-xl border-2 transition-all"
                style={{ borderColor: pkg.isActive ? 'var(--clay-yellow)' : 'rgba(255,255,255,0.08)', background: 'var(--bg-panel)', opacity: pkg.isActive ? 1 : 0.5 }}>
                <div className="flex items-center gap-4">
                  <div className="text-center w-16">
                    <p className="text-2xl font-black text-white">{pkg.tokens}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--clay-yellow)' }}>tokens</p>
                  </div>
                  <div>
                    <p className="font-black text-white">{pkg.name}</p>
                    <p className="text-sm font-bold" style={{ color: 'var(--clay-mint)' }}>${Number(pkg.priceUSD).toFixed(2)} USD</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleToggleActive(pkg)}
                    className="text-xs px-2 py-1 rounded-lg font-bold border"
                    style={{ borderColor: pkg.isActive ? 'var(--clay-mint)' : 'rgba(255,255,255,0.2)', color: pkg.isActive ? 'var(--clay-mint)' : 'var(--text-muted)' }}>
                    {pkg.isActive ? 'Activo' : 'Inactivo'}
                  </button>
                  <button onClick={() => { setEditId(pkg.id); setForm({ name: pkg.name, tokens: String(pkg.tokens), priceUSD: pkg.priceUSD, sortOrder: String(pkg.sortOrder) }); setShowForm(true); }}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors" style={{ color: 'var(--clay-yellow)' }}>
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(pkg.id)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors" style={{ color: '#ff5050' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
