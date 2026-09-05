'use client';

import { useEffect, useState } from 'react';
import { API } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Code2, Plus, Trash2, Copy, Key } from 'lucide-react';

export default function AdminApiKeysPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/auth/login');
    if (isAdmin) fetchKeys();
  }, [isAdmin, authLoading]);

  const fetchKeys = () => {
    setLoading(true);
    API.PUBLIC_API.listKeys().then((res) => {
      if (res.success) setKeys(res.data);
    }).catch(console.error).finally(() => setLoading(false));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    try {
      await API.PUBLIC_API.createKey(newKeyName);
      setIsCreating(false);
      setNewKeyName('');
      fetchKeys();
    } catch (e: any) {
      alert(e.message || 'Error al generar API Key');
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas revocar esta API Key? Dejará de funcionar inmediatamente.')) return;
    try {
      await API.PUBLIC_API.revokeKey(id);
      fetchKeys();
    } catch (e: any) {
      alert(e.message || 'Error al revocar');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('API Key copiada al portapapeles');
  };

  if (authLoading || loading) return <div className="p-8 flex justify-center"><div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin border-[var(--color-primary)]" style={{ borderTopColor: 'transparent' }} /></div>;

  return (
    <div className="p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Code2 className="text-[var(--color-secondary)]" size={32} />
            API Pública (Terceros)
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Genera tokens de acceso para clientes externos o integraciones</p>
        </div>
        <button onClick={() => setIsCreating(true)} className="px-6 py-2.5 rounded-xl font-bold text-sm transition-transform hover:scale-105 active:scale-95 bg-[var(--color-primary)] text-black flex items-center gap-2">
          <Plus size={18} /> Nueva API Key
        </button>
      </div>

      {isCreating && (
        <div className="bg-[var(--bg-panel)] backdrop-blur-md border border-[var(--border-subtle)] p-6 rounded-2xl mb-8 shadow-xl max-w-lg">
          <h2 className="text-xl font-bold text-white mb-4">Generar API Key</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-white/60 mb-2 block uppercase tracking-wider">Nombre (Identificador del cliente)</label>
              <input type="text" required value={newKeyName} onChange={e => setNewKeyName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-colors" placeholder="Ej: App de CinePlus" />
            </div>
            <div className="flex gap-4 pt-4">
              <button type="submit" className="px-6 py-3 rounded-xl font-bold text-sm bg-[var(--color-primary)] text-black hover:scale-105 transition-transform">Generar</button>
              <button type="button" onClick={() => setIsCreating(false)} className="px-6 py-3 rounded-xl font-bold text-sm bg-white/10 text-white hover:bg-white/20 transition-colors">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-2xl overflow-hidden border border-[var(--border-subtle)] shadow-2xl backdrop-blur-xl bg-[var(--bg-panel)] scale-[0.92] origin-top">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-[var(--border-subtle)] bg-black/20 text-white/80 tracking-wider uppercase text-[13px]">
              <tr>
                <th className="px-4 py-3 font-bold">Nombre / Proyecto</th>
                <th className="px-4 py-3 font-bold">API Key (Token)</th>
                <th className="px-4 py-3 font-bold">Estado</th>
                <th className="px-4 py-3 font-bold">Creación</th>
                <th className="px-4 py-3 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="text-[13px] text-white/80">
              {keys.map((k) => (
                <tr key={k.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="px-4 py-3 font-bold text-white text-[13px]">{k.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <code className="bg-black/50 px-2 py-1 rounded-md border border-white/5 text-[var(--color-primary)] font-mono text-xs tracking-widest shadow-inner">
                        {k.isActive ? `${k.key.substring(0, 10)}...${k.key.substring(k.key.length - 6)}` : 'REVOCADA'}
                      </code>
                      {k.isActive && (
                        <button onClick={() => { navigator.clipboard.writeText(k.key); alert('API Key copiada'); }}
                          className="text-[var(--text-muted)] hover:text-white transition-colors" title="Copiar Token">
                          <Key size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-colors ${k.isActive ? 'text-green-400 border-green-500/50 bg-green-500/10' : 'text-red-400 border-red-500/50 bg-red-500/10'}`}>
                      {k.isActive ? 'Activa' : 'Revocada'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-muted)] text-[12px]">{new Date(k.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {k.isActive && (
                        <button onClick={() => handleRevoke(k.id)}
                          className="px-3 py-1.5 rounded-xl font-bold text-[12px] bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors">
                          Revocar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {keys.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <Code2 size={48} className="mx-auto mb-4 text-[var(--text-muted)] opacity-50" />
                    <p className="text-[var(--text-muted)]">No has generado ninguna API Key todavía.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
