'use client';

import { useEffect, useState } from 'react';
import { Key, Plus, Trash2, Search, Filter } from 'lucide-react';
import { API, apiFetch } from '@/lib/api';

export default function CodigosAdminPage() {
  const [codes, setCodes] = useState<any[]>([]);
  const [contentList, setContentList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ contentId: '', notes: '', expiresAt: '' });
  const [creating, setCreating] = useState(false);
  const [createResult, setCreateResult] = useState<any>(null);
  const [filterUsed, setFilterUsed] = useState<string>('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const fetchCodes = async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20', ...(filterUsed ? { isUsed: filterUsed } : {}) });
    const res = await apiFetch(`${API.ADMIN.CODES}?${params}`);
    if (res.success) { setCodes(res.data || []); setTotal(res.meta?.total || 0); }
    setLoading(false);
  };

  useEffect(() => { fetchCodes(); }, [page, filterUsed]);

  useEffect(() => {
    apiFetch(`${API.ADMIN.CONTENT}?limit=100`).then(res => {
      if (res.success) setContentList(res.data || []);
    });
  }, []);

  const handleCreate = async () => {
    if (!createForm.contentId) return;
    setCreating(true);
    try {
      const res = await apiFetch(API.ADMIN.CODES, {
        method: 'POST',
        body: JSON.stringify({
          contentId: createForm.contentId,
          notes: createForm.notes || undefined,
          expiresAt: createForm.expiresAt || undefined,
        }),
      });
      setCreateResult(res.data);
      fetchCodes();
    } catch (e: any) {
      alert(e.message);
    } finally { setCreating(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este código?')) return;
    await apiFetch(API.ADMIN.CODE(id), { method: 'DELETE' });
    fetchCodes();
  };

  const filtered = codes.filter(c =>
    search ? c.code.includes(search.toUpperCase()) || c.contentTitle?.toLowerCase().includes(search.toLowerCase()) : true
  );

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Key size={24} style={{ color: 'var(--clay-yellow)' }} /> Códigos de Descarga
          </h1>
          <p className="text-sm text-[#6B7280]">{total} códigos en total</p>
        </div>
        <button onClick={() => { setShowCreate(true); setCreateResult(null); }}
          className="btn-clay btn-clay-yellow flex items-center gap-2">
          <Plus size={16} /> Generar código
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar código o contenido..." className="clay-input pl-9 text-sm w-64" />
        </div>
        <select value={filterUsed} onChange={(e) => setFilterUsed(e.target.value)} className="clay-input text-sm w-auto">
          <option value="">Todos los estados</option>
          <option value="false">Disponibles</option>
          <option value="true">Usados</option>
        </select>
      </div>

      {/* Table */}
      <div className="clay-card-dark rounded-[16px] overflow-hidden border-[2px] border-[#3A3A5C]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#3A3A5C]" style={{ background: '#1A1A2E' }}>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#6B7280] uppercase tracking-wider">Código</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#6B7280] uppercase tracking-wider">Contenido</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#6B7280] uppercase tracking-wider">Estado</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#6B7280] uppercase tracking-wider">Usado por</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#6B7280] uppercase tracking-wider">Creado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="clay-skeleton h-6 rounded" /></td></tr>
                ))
              ) : filtered.map((c) => (
                <tr key={c.id} className="border-b border-[#3A3A5C] hover:bg-white/5 transition-all">
                  <td className="px-4 py-3">
                    <span className="font-black tracking-wider" style={{ fontFamily: 'monospace', color: 'var(--clay-yellow)' }}>
                      {c.code}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-semibold text-white text-xs truncate max-w-48">{c.contentTitle}</p>
                      <span className="clay-badge text-[10px] text-[#6B7280] border-[#3A3A5C]">{c.contentType}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`clay-badge text-[10px] ${c.isUsed ? 'text-[#6B7280] border-[#3A3A5C]' : ''}`}
                      style={!c.isUsed ? { color: 'var(--clay-mint)', borderColor: 'var(--clay-mint)' } : {}}>
                      {c.isUsed ? '✓ Usado' : '● Disponible'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#A8B3C8]">
                    {c.usedBy ? c.usedBy.email : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#6B7280]">
                    {new Date(c.createdAt).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-4 py-3">
                    {!c.isUsed && (
                      <button onClick={() => handleDelete(c.id)}
                        className="p-1.5 rounded-[6px] text-[#FF6B6B] hover:bg-[#FF6B6B]/10 transition-all">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && !loading && (
          <div className="text-center py-12">
            <Key size={32} className="mx-auto mb-3 text-[#3A3A5C]" />
            <p className="text-[#6B7280]">No hay códigos</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(15,15,26,0.9)', backdropFilter: 'blur(8px)' }}>
          <div className="clay-card-dark p-8 rounded-[24px] w-full max-w-md border-[3px]"
            style={{ borderColor: 'var(--clay-yellow)', boxShadow: '8px 8px 0px var(--clay-yellow)' }}>
            <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
              <Key size={20} style={{ color: 'var(--clay-yellow)' }} /> Generar Código
            </h2>

            {!createResult ? (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#A8B3C8] mb-1.5 block">Contenido *</label>
                  <select value={createForm.contentId}
                    onChange={(e) => setCreateForm(p => ({ ...p, contentId: e.target.value }))}
                    className="clay-input text-sm">
                    <option value="">Seleccionar contenido...</option>
                    {contentList.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.title} ({c.type})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#A8B3C8] mb-1.5 block">Notas (opcional)</label>
                  <input type="text" value={createForm.notes}
                    onChange={(e) => setCreateForm(p => ({ ...p, notes: e.target.value }))}
                    placeholder="ej: Para cliente Juan" className="clay-input text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#A8B3C8] mb-1.5 block">Vence el (opcional)</label>
                  <input type="datetime-local" value={createForm.expiresAt}
                    onChange={(e) => setCreateForm(p => ({ ...p, expiresAt: e.target.value }))}
                    className="clay-input text-sm" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowCreate(false)} className="btn-clay btn-clay-dark flex-1">Cancelar</button>
                  <button onClick={handleCreate} disabled={creating || !createForm.contentId}
                    className="btn-clay btn-clay-yellow flex-1 disabled:opacity-60">
                    {creating ? 'Generando...' : 'Generar'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-4xl mb-4">🎉</div>
                <p className="text-[#A8B3C8] text-sm mb-2">Código generado para</p>
                <p className="font-bold text-white mb-6">{createResult.contentTitle}</p>
                <div className="p-4 rounded-[14px] border-[3px] mb-6"
                  style={{ background: 'rgba(255,230,109,0.1)', borderColor: 'var(--clay-yellow)', boxShadow: '4px 4px 0px var(--clay-yellow)' }}>
                  <p className="font-black text-3xl tracking-widest" style={{ color: 'var(--clay-yellow)', fontFamily: 'monospace' }}>
                    {createResult.code}
                  </p>
                </div>
                <button onClick={() => navigator.clipboard.writeText(createResult.code)}
                  className="btn-clay btn-clay-yellow mb-3 w-full">Copiar código</button>
                <button onClick={() => { setShowCreate(false); setCreateResult(null); setCreateForm({ contentId: '', notes: '', expiresAt: '' }); }}
                  className="btn-clay btn-clay-dark w-full">Cerrar</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
