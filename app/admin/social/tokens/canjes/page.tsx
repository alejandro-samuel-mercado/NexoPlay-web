'use client';

import { useState, useEffect } from 'react';
import { API, apiFetch } from '@/lib/api';

import { Gift, Copy, Check, Search } from 'lucide-react';


type Redemption = {
  id: string;
  code: string;
  createdAt: string;
  goal: {
    name: string;
    type: string;
  };
  user: {
    name: string;
    email: string;
  };
};

export default function TokenRedemptionsPage() {
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchRedemptions();
  }, []);

  const fetchRedemptions = async () => {
    try {
      const res = await apiFetch(API.SOCIAL_ADMIN.REDEMPTIONS);
      setRedemptions(res.data);
    } catch (error) {
      alert('Error al cargar canjes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    alert('Código copiado al portapapeles');
  };

  const filtered = redemptions.filter(r => 
    r.code.toLowerCase().includes(search.toLowerCase()) || 
    r.user.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.user.email?.toLowerCase().includes(search.toLowerCase()) ||
    r.goal.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Gift className="text-[#E82C7C]" size={20} />
            Canjes Realizados
          </h2>
          <p className="text-sm text-[#8B8FA8] mt-1">Historial de premios canjeados por los usuarios en Nuba Social.</p>
        </div>
        
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B8FA8]" />
          <input
            type="text"
            placeholder="Buscar código, usuario, premio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#1E1E3A] border border-[var(--border-subtle)] rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-[#E82C7C] w-full md:w-72"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 rounded-full border-4 border-[#E82C7C] border-t-transparent animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-[#1E1E3A] border border-[var(--border-subtle)] rounded-xl">
          <p className="text-[#8B8FA8]">No se encontraron canjes.</p>
        </div>
      ) : (
        <div className="bg-[#1E1E3A] border border-[var(--border-subtle)] rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap min-w-[800px]">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-black/20">
                <th className="p-4 text-xs font-bold text-[#8B8FA8] uppercase">Fecha</th>
                <th className="p-4 text-xs font-bold text-[#8B8FA8] uppercase">Usuario</th>
                <th className="p-4 text-xs font-bold text-[#8B8FA8] uppercase">Premio</th>
                <th className="p-4 text-xs font-bold text-[#8B8FA8] uppercase">Código Generado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <span className="text-sm text-white">
                      {new Date(r.createdAt).toLocaleString('es-AR', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#E82C7C]/20 flex items-center justify-center text-[10px] font-bold text-[#E82C7C]">
                        {r.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{r.user.name}</p>
                        <p className="text-xs text-[#8B8FA8]">{r.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-bold text-white">{r.goal.name}</p>
                    <p className="text-[10px] text-[#8B8FA8] uppercase tracking-wider">{r.goal.type === 'DOWNLOAD_CODE' ? 'Descarga' : 'Suscripción'}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <code className="bg-black/40 border border-[#E82C7C]/30 text-[#E82C7C] font-mono font-bold px-2 py-1 rounded text-sm tracking-widest">
                        {r.code}
                      </code>
                      <button
                        onClick={() => handleCopy(r.code, r.id)}
                        className="p-1.5 rounded hover:bg-white/10 text-[#8B8FA8] hover:text-white transition-colors"
                        title="Copiar código"
                      >
                        {copiedId === r.id ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
