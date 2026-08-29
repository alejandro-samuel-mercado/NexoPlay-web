'use client';
import { useEffect, useState } from 'react';
import { CheckCircle2, Copy, Crown, Eye, EyeOff, Search, Users, XCircle } from 'lucide-react';
import { API_BASE, API, apiFetch } from '@/lib/api';

const R = (path: string) => `${API_BASE}/api/reseller${path}`;


export default function ResellerUsuariosPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [createModal, setCreateModal] = useState(false);
  const [assignModal, setAssignModal] = useState<{ userId: string; email: string } | null>(null);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'SUBSCRIBER' });
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3200); };

  const fetchUsers = async (s = search) => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '50', role: 'SUBSCRIBER', ...(s ? { search: s } : {}) });
    const res = await apiFetch(R(`/users?${params}`)).catch(() => null);
    if (res?.success) { setUsers(res.data || []); setTotal(res.meta?.total || res.data?.length || 0); }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);
  useEffect(() => {
    apiFetch(`${API_BASE}/api/tokens/plans`).then(r => { if (r.success) setPlans(r.data?.filter((p: any) => p.role === 'SUBSCRIBER' || p.role === 'GUEST') || []); });
  }, []);

  const handleCreate = async () => {
    if (!newUser.username || !newUser.password) return showToast('Usuario y contraseña son obligatorios', false);
    try {
      await apiFetch(R('/users'), { method: 'POST', body: JSON.stringify(newUser) });
      setCreateModal(false);
      setNewUser({ username: '', password: '', role: 'SUBSCRIBER' });
      fetchUsers();
      showToast('Usuario creado correctamente');
    } catch (e: any) { showToast(e.message || 'Error al crear usuario', false); }
  };

  const handleAssign = async () => {
    if (!assignModal) return;
    try {
      await apiFetch(R(`/users/${assignModal.userId}/subscription`), { method: 'POST', body: JSON.stringify({ planId: selectedPlan || null }) });
      setAssignModal(null); fetchUsers(); showToast('Plan asignado correctamente');
    } catch (e: any) { showToast(e.message || 'Error al asignar plan', false); }
  };

  const handleToggle = async (id: string, active: boolean) => {
    try {
      await apiFetch(R(`/users/${id}`), { method: 'PATCH', body: JSON.stringify({ isActive: !active }) });
      fetchUsers(); showToast(active ? 'Usuario suspendido' : 'Usuario activado');
    } catch (e: any) { showToast(e.message || 'Error', false); }
  };

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#34D399] transition-colors";

  return (
    <div className="p-6 sm:p-8">
      {toast && (
        <div className={`fixed top-5 right-5 z-[200] px-4 py-3 rounded-xl text-sm font-bold shadow-2xl flex items-center gap-2`}
          style={{ background: toast.ok ? '#34D399' : '#EF4444', color: '#0a0f0a' }}>
          {toast.ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />} {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Users size={28} style={{ color: '#34D399' }} /> Mis Clientes
          </h1>
          <p className="text-sm mt-1" style={{ color: '#6B7280' }}>{total} suscriptores registrados</p>
        </div>
        <button onClick={() => setCreateModal(true)}
          className="px-5 py-2.5 rounded-xl font-bold text-sm hover:scale-105 transition-transform"
          style={{ background: '#34D399', color: '#0a0f0a' }}>
          + Crear Cliente
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#6B7280' }} />
        <input value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && fetchUsers()}
          placeholder="Buscar por usuario o email..."
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white outline-none focus:border-[#34D399] transition-colors" />
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden border border-[var(--border-subtle)] shadow-2xl" style={{ background: 'var(--bg-panel)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-white/5" style={{ background: 'rgba(0,0,0,0.2)' }}>
                {['Cliente', 'Contraseña', 'Plan', 'Estado', 'Registro', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-bold tracking-wider uppercase" style={{ color: 'rgba(255,255,255,0.5)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-white/5">
                  <td colSpan={6} className="px-4 py-4"><div className="h-10 bg-white/5 rounded-lg animate-pulse" /></td>
                </tr>
              )) : users.map(u => {
                const subActive = u.subscription?.status === 'ACTIVE';
                return (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm" style={{ background: 'rgba(52,211,153,0.1)', color: '#34D399' }}>
                          {(u.username || u.email || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-bold text-white">{u.username || u.email}</p>
                            <button onClick={() => navigator.clipboard.writeText(u.username || u.email)} title="Copiar" className="hover:text-white transition-colors" style={{ color: '#6B7280' }}>
                              <Copy size={11} />
                            </button>
                          </div>
                          <p className="text-[11px] mt-0.5" style={{ color: '#6B7280' }}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-mono" style={{ color: '#34D399' }}>
                          {u.plainPassword ? (visible[u.id] ? u.plainPassword : '••••••••') : '••••••••'}
                        </span>
                        {u.plainPassword && (
                          <>
                            <button onClick={() => setVisible(v => ({ ...v, [u.id]: !v[u.id] }))} className="hover:text-white transition-colors" style={{ color: '#6B7280' }}>
                              {visible[u.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                            </button>
                            <button onClick={() => navigator.clipboard.writeText(u.plainPassword)} className="hover:text-white transition-colors" style={{ color: '#6B7280' }}>
                              <Copy size={12} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {subActive ? (
                        <div className="flex items-center gap-1.5">
                          <Crown size={13} style={{ color: '#34D399' }} />
                          <span className="text-white font-bold text-[12px]">{u.subscription?.plan?.name || 'Activo'}</span>
                        </div>
                      ) : (
                        <span className="text-[12px]" style={{ color: '#6B7280' }}>Sin plan</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {u.isActive
                        ? <span className="text-green-400 font-bold flex items-center gap-1 text-[12px]"><CheckCircle2 size={13} /> Activo</span>
                        : <span className="text-red-400 font-bold flex items-center gap-1 text-[12px]"><XCircle size={13} /> Suspendido</span>}
                    </td>
                    <td className="px-4 py-3 text-[12px]" style={{ color: '#6B7280' }}>{new Date(u.createdAt).toLocaleDateString('es-AR')}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleToggle(u.id, u.isActive)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${u.isActive ? 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'}`}>
                          {u.isActive ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                        </button>
                        <button onClick={() => { setAssignModal({ userId: u.id, email: u.email }); setSelectedPlan(u.subscription?.planId || ''); }}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center gap-1.5">
                          <Crown size={13} /> Plan
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && users.length === 0 && (
                <tr><td colSpan={6} className="py-16 text-center">
                  <Users size={40} className="mx-auto mb-3 opacity-20 text-white" />
                  <p style={{ color: '#6B7280' }}>Sin clientes aún. Crea el primero.</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear */}
      {createModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="p-8 rounded-[24px] w-full max-w-sm border border-[var(--border-subtle)] shadow-2xl" style={{ background: 'var(--bg-panel)' }}>
            <h3 className="text-xl font-black text-white mb-6">Crear Nuevo Cliente</h3>
            <div className="space-y-3">
              <input type="text" placeholder="Nombre de usuario" value={newUser.username}
                onChange={e => setNewUser({ ...newUser, username: e.target.value })} className={inputCls} />
              <input type="text" placeholder="Contraseña" value={newUser.password}
                onChange={e => setNewUser({ ...newUser, password: e.target.value })} className={inputCls} />
              <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} className={inputCls}>
                <option value="SUBSCRIBER" className="bg-black">Suscriptor</option>
                <option value="GUEST" className="bg-black">Invitado (gratis)</option>
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setCreateModal(false)} className="flex-1 px-4 py-3 rounded-xl font-bold text-sm bg-white/10 text-white hover:bg-white/20 transition-colors">Cancelar</button>
              <button onClick={handleCreate} className="flex-1 px-4 py-3 rounded-xl font-bold text-sm hover:scale-105 transition-transform" style={{ background: '#34D399', color: '#0a0f0a' }}>Crear</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Asignar Plan */}
      {assignModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="p-8 rounded-[24px] w-full max-w-sm border border-[var(--border-subtle)] shadow-2xl" style={{ background: 'var(--bg-panel)' }}>
            <h3 className="text-xl font-black text-white mb-2">Asignar Plan</h3>
            <p className="text-sm mb-6" style={{ color: '#6B7280' }}>Cliente: {assignModal.email}</p>
            <select value={selectedPlan} onChange={e => setSelectedPlan(e.target.value)} className={inputCls + ' mb-6'}>
              <option value="" className="bg-black">Ninguno (remover plan)</option>
              {plans.map(p => <option key={p.id} value={p.id} className="bg-black">{p.name} — {p.tokenCost || 0} tokens / {p.durationDays} días</option>)}
            </select>
            <div className="flex gap-3">
              <button onClick={() => setAssignModal(null)} className="flex-1 px-4 py-3 rounded-xl font-bold text-sm bg-white/10 text-white hover:bg-white/20 transition-colors">Cancelar</button>
              <button onClick={handleAssign} className="flex-1 px-4 py-3 rounded-xl font-bold text-sm hover:scale-105 transition-transform" style={{ background: '#34D399', color: '#0a0f0a' }}>Asignar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
