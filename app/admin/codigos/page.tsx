'use client';

import { useEffect, useState } from 'react';
import { Key, Plus, Trash2, Search, Filter, Ticket } from 'lucide-react';
import { API, apiFetch } from '@/lib/api';

export default function CodigosAdminPage() {
  const [codes, setCodes] = useState<any[]>([]);
  const [contentList, setContentList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ contentId: '', notes: '', expiresAt: '', isCatalog: false, isGeneric: false });
  const [creating, setCreating] = useState(false);
  const [createResult, setCreateResult] = useState<any>(null);
  const [filterUsed, setFilterUsed] = useState<string>('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const fetchCodes = async (forceSearch?: string) => {
    setLoading(true);
    const currentSearch = forceSearch !== undefined ? forceSearch : search;
    const params = new URLSearchParams({ 
      page: String(page), limit: '15', 
      ...(currentSearch ? { search: currentSearch } : {}),
      ...(filterUsed ? { isUsed: filterUsed } : {}) 
    });
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
    if (!createForm.isCatalog && !createForm.isGeneric && !createForm.contentId) return;
    setCreating(true);
    try {
      const res = await apiFetch(API.ADMIN.CODES, {
        method: 'POST',
        body: JSON.stringify({
          contentId: (createForm.isCatalog || createForm.isGeneric) ? undefined : createForm.contentId,
          isCatalog: createForm.isCatalog,
          isGeneric: createForm.isGeneric,
          notes: (createForm.isCatalog || createForm.isGeneric) ? undefined : (createForm.notes || undefined),
          expiresAt: createForm.expiresAt ? new Date(`${createForm.expiresAt}T23:59:59`).toISOString() : undefined,
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

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Key size={28} style={{ color: 'var(--color-secondary)' }} /> Códigos de Descarga
          </h1>
          <button onClick={() => { setShowCreate(true); setCreateResult(null); }}
            className="px-6 py-2.5 rounded-xl font-bold text-sm transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
            style={{ background: 'var(--color-primary)', color: '#000' }}>
            <Plus size={16} /> Generar código
          </button>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{total} códigos en total</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="relative flex-1 lg:w-96">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input value={search} onChange={(e) => {
            setSearch(e.target.value);
            if (e.target.value === '') {
              fetchCodes('');
            }
          }}
            placeholder="Buscar por código (ej: NXB-...)" 
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2 text-sm text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-colors backdrop-blur-md" 
          />
        </div>
        <select value={filterUsed} onChange={(e) => setFilterUsed(e.target.value)} 
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors backdrop-blur-md">
          <option value="" className="bg-black">Todos los estados</option>
          <option value="false" className="bg-black">Disponibles</option>
          <option value="true" className="bg-black">Usados</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden border border-[var(--border-subtle)] shadow-2xl backdrop-blur-xl bg-[var(--bg-panel)] scale-[0.92] origin-top">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-black/20">
                <th className="text-left px-4 py-3 text-[13px] font-bold tracking-wider text-white/80 uppercase">Código</th>
                <th className="text-left px-4 py-3 text-[13px] font-bold tracking-wider text-white/80 uppercase">Contenido</th>
                <th className="text-left px-4 py-3 text-[13px] font-bold tracking-wider text-white/80 uppercase">Creador</th>
                <th className="text-left px-4 py-3 text-[13px] font-bold tracking-wider text-white/80 uppercase">Estado</th>
                <th className="text-left px-4 py-3 text-[13px] font-bold tracking-wider text-white/80 uppercase">Creación</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5"><td colSpan={6} className="px-5 py-4"><div className="h-10 bg-white/5 rounded-lg animate-pulse w-full" /></td></tr>
                ))
              ) : codes.map((c) => {
                const isExpired = c.expiresAt && new Date(c.expiresAt) < new Date();
                return (
                  <tr key={c.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-black/20 border border-[var(--border-subtle)] flex items-center justify-center text-[var(--color-primary)]">
                          <Ticket size={16} />
                        </div>
                        <div>
                          <p className="font-mono text-[13px] font-bold tracking-wider text-[var(--color-primary)]">{c.code}</p>
                          {c.notes && <p className="text-[11px] text-[var(--text-muted)] truncate max-w-[150px]">{c.notes}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-white text-[13px] truncate max-w-[200px]">{c.contentTitle || '—'}</p>
                      <p className="text-[11px] text-[var(--text-muted)] capitalize">{c.contentType}</p>
                    </td>
                    <td className="px-4 py-3 text-[12px]">
                      <p className="text-white">{c.adminName || '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      {c.isUsed ? (
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border text-red-400 border-red-500/20 bg-red-500/10">Usado</span>
                      ) : isExpired ? (
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border text-gray-400 border-gray-500/20 bg-gray-500/10">Expirado</span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border text-green-400 border-green-500/20 bg-green-500/10">Disponible</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[12px] text-[var(--text-muted)]">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                    {!c.isUsed && (
                      <button onClick={() => handleDelete(c.id)}
                        className="p-2.5 rounded-xl text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {codes.length === 0 && !loading && (
          <div className="text-center py-16">
            <Key size={48} className="mx-auto mb-4 text-[var(--text-muted)] opacity-50" />
            <p className="text-[var(--text-muted)]">No hay códigos</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {total > 15 && (
        <div className="flex items-center justify-between mt-6 bg-[var(--bg-panel)] p-4 rounded-xl border border-[var(--border-subtle)]">
          <span className="text-sm text-[var(--text-muted)] font-bold">
            Mostrando {(page - 1) * 15 + 1} - {Math.min(page * 15, total)} de {total}
          </span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-sm font-bold transition-colors text-white">Anterior</button>
            <button disabled={page * 15 >= total} onClick={() => setPage(page + 1)} className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-sm font-bold transition-colors text-white">Siguiente</button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-panel)] p-8 rounded-[24px] w-full max-w-md border border-[var(--border-subtle)] backdrop-blur-xl shadow-2xl">
            <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
              <Key size={24} style={{ color: 'var(--color-primary)' }} /> Generar Código
            </h3>

            {!createResult ? (
              <div className="space-y-4">
                <div className="flex flex-col gap-3 mb-2">
                  <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                    <input type="checkbox" id="isCatalog"
                      checked={createForm.isCatalog}
                      onChange={(e) => setCreateForm(p => ({ ...p, isCatalog: e.target.checked, isGeneric: false, contentId: '', notes: '' }))}
                      className="w-5 h-5 accent-[var(--color-primary)]"
                    />
                    <label htmlFor="isCatalog" className="text-sm font-bold text-white cursor-pointer select-none">
                      Código de Catálogo Completo (Desbloquea todo)
                    </label>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                    <input type="checkbox" id="isGeneric"
                      checked={createForm.isGeneric}
                      onChange={(e) => setCreateForm(p => ({ ...p, isGeneric: e.target.checked, isCatalog: false, contentId: '', notes: '' }))}
                      className="w-5 h-5 accent-[var(--color-primary)]"
                    />
                    <label htmlFor="isGeneric" className="text-sm font-bold text-white cursor-pointer select-none flex flex-col">
                      <span>Código Genérico (Comodín)</span>
                      <span className="text-xs text-white/50 font-normal mt-0.5">Un solo uso para desbloquear cualquier película o serie que el usuario elija</span>
                    </label>
                  </div>
                </div>
                
                {!createForm.isCatalog && !createForm.isGeneric && (
                  <div>
                    <label className="text-xs font-bold text-white/60 mb-2 block uppercase tracking-wider">Contenido *</label>
                    <select value={createForm.contentId}
                      onChange={(e) => setCreateForm(p => ({ ...p, contentId: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors">
                      <option value="" className="bg-black">Seleccionar contenido...</option>
                      {contentList.map((c: any) => (
                        <option key={c.id} value={c.id} className="bg-black">{c.title} ({c.type})</option>
                      ))}
                    </select>
                  </div>
                )}
                
                {!createForm.isCatalog && !createForm.isGeneric && (
                  <div>
                    <label className="text-xs font-bold text-white/60 mb-2 block uppercase tracking-wider">Notas (opcional)</label>
                    <input type="text" value={createForm.notes}
                      onChange={(e) => setCreateForm(p => ({ ...p, notes: e.target.value }))}
                      placeholder="ej: Para cliente Juan" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-colors" />
                  </div>
                )}
                
                <div>
                  <label className="text-xs font-bold text-white/60 mb-2 block uppercase tracking-wider">Vence el (opcional)</label>
                  <input type="date" value={createForm.expiresAt}
                    onChange={(e) => setCreateForm(p => ({ ...p, expiresAt: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors [color-scheme:dark]" />
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={() => setShowCreate(false)} className="px-4 py-3 rounded-xl font-bold text-sm bg-white/10 text-white hover:bg-white/20 transition-colors flex-1">Cancelar</button>
                  <button onClick={handleCreate} disabled={creating || (!createForm.isCatalog && !createForm.isGeneric && !createForm.contentId)}
                    className="px-4 py-3 rounded-xl font-bold text-sm bg-[var(--color-primary)] text-black hover:scale-105 transition-transform flex-1 disabled:opacity-50 disabled:hover:scale-100">
                    {creating ? 'Generando...' : 'Generar'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-[var(--text-muted)] text-sm mb-2">Código generado para</p>
                <p className="font-bold text-white mb-6 text-lg">{createResult.contentTitle}</p>
                <div className="p-6 rounded-2xl border border-[var(--color-primary)] bg-[var(--color-primary)]/10 mb-8 shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.2)]">
                  <p className="font-black text-3xl tracking-widest break-all" style={{ color: 'var(--color-primary)', fontFamily: 'monospace' }}>
                    {createResult.code}
                  </p>
                </div>
                <div className="space-y-3">
                  <button onClick={() => navigator.clipboard.writeText(createResult.code)}
                    className="w-full px-4 py-3 rounded-xl font-bold text-sm bg-[var(--color-primary)] text-black hover:scale-105 transition-transform shadow-lg">Copiar código</button>
                  <button onClick={() => { setShowCreate(false); setCreateResult(null); setCreateForm({ contentId: '', notes: '', expiresAt: '', isCatalog: false, isGeneric: false }); }}
                    className="w-full px-4 py-3 rounded-xl font-bold text-sm bg-white/10 text-white hover:bg-white/20 transition-colors">Cerrar</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
