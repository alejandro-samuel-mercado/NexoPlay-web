'use client';

import { useEffect, useState } from 'react';
import { API } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Code2, Plus, Trash2, Copy } from 'lucide-react';

export default function AdminApiKeysPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/');
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

  if (authLoading || loading) return <div className="p-8"><div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin border-[var(--clay-orange)]" /></div>;

  return (
    <div className="p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Code2 className="text-[var(--clay-orange)]" size={32} />
            API Pública (Terceros)
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">Genera tokens de acceso para clientes externos o integraciones</p>
        </div>
        <button onClick={() => setIsCreating(true)} className="btn-clay flex items-center gap-2">
          <Plus size={18} /> Nueva API Key
        </button>
      </div>

      {isCreating && (
        <div className="clay-card-dark p-6 rounded-[20px] mb-8 border border-gray-700 max-w-lg">
          <h2 className="text-xl font-bold text-white mb-4">Generar API Key</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Nombre (Identificador del cliente)</label>
              <input type="text" required value={newKeyName} onChange={e => setNewKeyName(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" placeholder="Ej: App de CinePlus" />
            </div>
            <div className="flex gap-4 pt-2">
              <button type="submit" className="bg-[var(--clay-orange)] text-black px-6 py-2 rounded font-bold hover:brightness-110">Generar</button>
              <button type="button" onClick={() => setIsCreating(false)} className="border border-gray-600 text-gray-300 px-6 py-2 rounded font-bold hover:text-white">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-[#12121A] rounded-[20px] border border-[#2A2A35] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#1A1A24] text-[#A8B3C8] text-xs uppercase">
            <tr>
              <th className="p-4 font-bold">Nombre / Proyecto</th>
              <th className="p-4 font-bold">API Key (Token)</th>
              <th className="p-4 font-bold">Estado</th>
              <th className="p-4 font-bold">Creación</th>
              <th className="p-4 font-bold">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-sm text-gray-300">
            {keys.map((k) => (
              <tr key={k.id} className="border-t border-[#2A2A35] hover:bg-white/5 transition-colors">
                <td className="p-4 font-medium text-white">{k.name}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <code className="bg-black/50 px-2 py-1 rounded text-[var(--clay-orange)] tracking-wider">
                      {k.isActive ? `${k.key.substring(0, 10)}...${k.key.substring(k.key.length - 6)}` : 'REVOCADA'}
                    </code>
                    {k.isActive && (
                      <button onClick={() => copyToClipboard(k.key)} className="p-1 hover:bg-white/10 rounded" title="Copiar">
                        <Copy size={16} />
                      </button>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${k.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {k.isActive ? 'Activa' : 'Revocada'}
                  </span>
                </td>
                <td className="p-4">{new Date(k.createdAt).toLocaleDateString()}</td>
                <td className="p-4">
                  {k.isActive && (
                    <button onClick={() => handleRevoke(k.id)} className="text-red-400 hover:text-red-300" title="Revocar acceso">
                      <Trash2 size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {keys.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  No has generado ninguna API Key todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
