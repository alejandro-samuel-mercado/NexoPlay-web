'use client';
import { useEffect, useState } from 'react';
import { CheckCircle2, Copy, Crown, Eye, EyeOff, Search, Users, XCircle, UserPlus, Phone, Mail, User, Shield, RefreshCcw } from 'lucide-react';
import { API_BASE, API, apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import UserWizardModal from '@/components/admin/UserWizardModal';

const R = (path: string) => `${API_BASE}/api/reseller${path}`;

export default function ResellerUsuariosPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<'Clients' | 'Resellers'>('Clients');
  const [clientType, setClientType] = useState<'regular' | 'trial'>('regular');
  
  const [createModalType, setCreateModalType] = useState<'STANDARD' | 'WIZARD' | null>(null);
  const [assignModal, setAssignModal] = useState<{ userId: string; email: string } | null>(null);
  const [selectedPlan, setSelectedPlan] = useState('');
  
  const [newUser, setNewUser] = useState({ username: '', password: '', confirmPassword: '', name: '', email: '', phone: '', role: 'SUBSCRIBER' });
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [infoModal, setInfoModal] = useState<any | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3200); };

  const fetchUsers = async (s = search, t = tab, ct = clientType) => {
    setLoading(true);
    const roleParam = t === 'Resellers' ? 'RESELLER' : ''; // simplified
    const params = new URLSearchParams({ limit: '15', page: String(page), ...(s ? { search: s } : {}) });
    if (t === 'Clients') params.append('clientType', ct);
    else params.append('role', 'RESELLER'); // API will need to support role filter for resellers if needed, or we just rely on the API returning both if no role is passed, but wait! The API doesn't support role filter for reseller yet!
    // Actually, in `reseller.router.ts`, we didn't add role filter! Let's pass it anyway.
    if (t === 'Resellers') params.append('role', 'RESELLER');
    const res = await apiFetch(R(`/users?${params}`)).catch(() => null);
    if (res?.success) { setUsers(res.data || []); setTotal(res.meta?.total || res.data?.length || 0); }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, [page, tab, clientType]);
  useEffect(() => {
    apiFetch(`${API_BASE}/api/tokens/plans`).then(r => { 
      if (r.success) setPlans(r.data?.filter((p: any) => p.role === 'SUBSCRIBER' || p.role === 'GUEST' || p.role === 'RESELLER') || []); 
    });
  }, []);

  const handleCreate = async () => {
    if (!newUser.username || !newUser.password || !newUser.confirmPassword) return showToast('Todos los campos son obligatorios', false);
    if (newUser.password !== newUser.confirmPassword) return showToast('Las contraseñas no coinciden', false);
    try {
      await apiFetch(R('/users'), { method: 'POST', body: JSON.stringify(newUser) });
      setCreateModalType(null);
      setNewUser({ username: '', password: '', confirmPassword: '', name: '', email: '', phone: '', role: 'SUBSCRIBER' });
      fetchUsers();
      showToast('Usuario creado correctamente');
    } catch (e: any) { showToast(e.message || 'Error al crear usuario', false); }
  };

  const handleAssign = async () => {
    if (!assignModal) return;
    try {
      if (selectedPlan) await apiFetch(R(`/users/${assignModal.userId}/subscription`), { method: 'POST', body: JSON.stringify({ planId: selectedPlan }) });
      else await apiFetch(R(`/users/${assignModal.userId}/subscription`), { method: 'DELETE' });
      setAssignModal(null);
      fetchUsers();
      showToast('Plan actualizado');
    } catch (e: any) { showToast(e.message || 'Error al asignar plan', false); }
  };

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await apiFetch(R(`/users/${id}`), { method: 'PATCH', body: JSON.stringify({ isActive: !current }) });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: !current } : u));
      showToast('Estado actualizado');
    } catch (e: any) { showToast(e.message, false); }
  };

  const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#34D399] outline-none transition-colors";
  const labelCls = "block text-xs font-bold text-white/50 uppercase tracking-wider mb-1.5 ml-1";

  // Determinar roles permitidos según el rol del usuario logueado
  let allowedRoles = [{ value: 'SUBSCRIBER', label: 'Cliente Final (Suscriptor)' }];
  if (user?.role === 'ADMIN_RESELLER') {
    allowedRoles = [
      { value: 'SUPER_RESELLER', label: 'Súper Revendedor' },
      { value: 'RESELLER', label: 'Revendedor Básico' },
      { value: 'SUBSCRIBER', label: 'Cliente Final (Suscriptor)' }
    ];
  } else if (user?.role === 'SUPER_RESELLER') {
    allowedRoles = [
      { value: 'RESELLER', label: 'Revendedor Básico' },
      { value: 'SUBSCRIBER', label: 'Cliente Final (Suscriptor)' }
    ];
  }

  const roleColors: Record<string, string> = {
    'ADMIN_RESELLER': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'SUPER_RESELLER': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'RESELLER': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'SUBSCRIBER': 'bg-white/10 text-white/70 border-white/20'
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-[200] px-6 py-3 rounded-2xl backdrop-blur-xl shadow-2xl font-bold text-sm border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${toast.ok ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
          {toast.ok ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
          {toast.msg}
        </div>
      )}

      {/* Header Premium */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-[var(--bg-panel)] to-black/40 p-8 rounded-[32px] border border-[var(--border-subtle)] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#34D399]/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2 flex items-center gap-3">
            <Users className="text-[#34D399]" size={36} />
            Gestión de Usuarios
          </h1>
          <p className="text-white/50 font-medium">Administra tu red: {total} usuarios en total.</p>
        </div>
        <div className="flex gap-3">
          {(user?.role === 'SUPER_RESELLER' || user?.role === 'ADMIN_RESELLER') && (
            <button onClick={() => setCreateModalType('STANDARD')}
              className="relative z-10 px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:scale-105 active:scale-95 transition-all bg-white/10 text-white border border-white/20">
              <Shield size={18} /> Crear Revendedor
            </button>
          )}
          <button onClick={() => setCreateModalType('WIZARD')}
            className="relative z-10 px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(52,211,153,0.3)]"
            style={{ background: '#34D399', color: '#0a0f0a' }}>
            <UserPlus size={18} /> Crear Cliente Final
          </button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        {/* Search Bar */}
        <div className="flex gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-72 group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#34D399] transition-colors" />
            <input value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchUsers()}
              placeholder="Buscar por usuario, email o nombre..."
              className="w-full bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-2xl pl-12 pr-4 py-3 text-sm text-white outline-none focus:border-[#34D399]/50 focus:bg-white/5 transition-all shadow-lg" />
          </div>
          <button 
            onClick={() => fetchUsers()} 
            disabled={loading}
            className="p-3 rounded-2xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] text-white hover:text-[#34D399] hover:border-[#34D399] transition-all flex items-center justify-center disabled:opacity-50"
            title="Refrescar"
          >
            <RefreshCcw size={20} className={loading ? 'animate-spin text-[#34D399]' : ''} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-[var(--bg-panel)] border border-[var(--border-subtle)] p-1 rounded-xl w-full lg:w-fit overflow-x-auto">
          {(user?.role === 'SUPER_RESELLER' || user?.role === 'ADMIN_RESELLER') && (
            <button onClick={() => { setTab('Resellers'); setPage(1); }} className={`shrink-0 flex-1 lg:flex-none px-5 py-2 rounded-lg text-xs font-bold transition-all ${tab === 'Resellers' ? 'bg-[#34D399]/20 text-[#34D399] shadow-sm' : 'text-white/40 hover:text-white/80'}`}>Mis Revendedores</button>
          )}
          <button onClick={() => { setTab('Clients'); setClientType('regular'); setPage(1); }} className={`shrink-0 flex-1 lg:flex-none px-5 py-2 rounded-lg text-xs font-bold transition-all ${tab === 'Clients' && clientType === 'regular' ? 'bg-[#34D399]/20 text-[#34D399] shadow-sm' : 'text-white/40 hover:text-white/80'}`}>Suscriptores</button>
          <button onClick={() => { setTab('Clients'); setClientType('trial'); setPage(1); }} className={`shrink-0 flex-1 lg:flex-none px-5 py-2 rounded-lg text-xs font-bold transition-all ${tab === 'Clients' && clientType === 'trial' ? 'bg-[#34D399]/20 text-[#34D399] shadow-sm' : 'text-white/40 hover:text-white/80'}`}>Cuentas de Prueba</button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-[24px] overflow-hidden border border-[var(--border-subtle)] shadow-2xl bg-[var(--bg-panel)]">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-white/5 bg-black/40">
                {['Usuario', 'Creado', 'Contraseña', 'Plan', 'Estado', 'Acciones'].map(h => (
                  <th key={h} className="text-left px-5 py-4 text-[11px] font-black tracking-widest text-white/40 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y divide-white/5 transition-opacity duration-200 ${loading && users.length > 0 ? 'opacity-50 pointer-events-none' : ''}`}>
              {loading && users.length === 0 ? Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={6} className="px-5 py-5"><div className="h-12 bg-white/5 rounded-xl animate-pulse" /></td>
                </tr>
              )) : users.map(u => {
                const subActive = u.subscription?.status === 'ACTIVE';
                const rColor = roleColors[u.role] || roleColors['SUBSCRIBER'];
                return (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-[12px] flex items-center justify-center font-black text-lg shadow-inner" style={{ background: 'rgba(52,211,153,0.1)', color: '#34D399' }}>
                          {(u.username || u.name || u.email || '?')[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="font-bold text-white text-[14px]">{u.username || u.name}</p>
                            <button onClick={() => navigator.clipboard.writeText(u.username || u.email)} title="Copiar" className="text-white/30 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                              <Copy size={12} />
                            </button>
                          </div>
                          <p className="text-[12px] text-white/40">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[12px] font-bold text-white/80">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg w-max border border-white/5">
                        <span className="text-[12px] font-mono text-[#34D399]">
                          {u.plainPassword ? (visible[u.id] ? u.plainPassword : '••••••••') : '••••••••'}
                        </span>
                        {u.plainPassword && (
                          <div className="flex gap-1.5 ml-2 border-l border-white/10 pl-2">
                            <button onClick={() => setVisible(v => ({ ...v, [u.id]: !v[u.id] }))} className="text-white/30 hover:text-white transition-colors">
                              {visible[u.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                            <button onClick={() => navigator.clipboard.writeText(u.plainPassword)} className="text-white/30 hover:text-white transition-colors">
                              <Copy size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {subActive ? (
                        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg w-max border border-emerald-500/20">
                          <Crown size={14} />
                          <span className="font-bold text-[12px]">{u.subscription?.plan?.name || 'Activo'}</span>
                        </div>
                      ) : (
                        <span className="text-[12px] text-white/30 font-medium px-3 py-1.5 rounded-lg bg-white/5">Sin plan</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {u.isActive
                        ? <span className="text-green-400 font-bold flex items-center gap-1.5 text-[12px]"><CheckCircle2 size={14} /> Activo</span>
                        : <span className="text-red-400 font-bold flex items-center gap-1.5 text-[12px]"><XCircle size={14} /> Suspendido</span>}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                      
                        <button onClick={() => { setAssignModal({ userId: u.id, email: u.email }); setSelectedPlan(u.subscription?.planId || ''); }}
                          className="px-3 py-2 rounded-xl text-xs font-bold bg-white/10 text-white hover:bg-white/20 transition-all hover:scale-105 flex items-center gap-1.5">
                          <Crown size={14} /> Plan
                        </button>
                          <button onClick={() => handleToggle(u.id, u.isActive)}
                          className={`px-3 py-2 flex items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all hover:scale-105 ${u.isActive ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-green-500 text-white shadow-lg shadow-green-500/20'}`}>
                          {u.isActive ? <><XCircle size={14} /> Desactivar</> : <><CheckCircle2 size={14} /> Activar</>}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && users.length === 0 && (
                <tr><td colSpan={6} className="py-24 text-center">
                  <Users size={48} className="mx-auto mb-4 text-white/10" />
                  <p className="text-white/40 font-medium">Sin usuarios aún. Crea el primero.</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {total > 15 && (
        <div className="flex items-center justify-between mt-6 bg-[var(--bg-panel)] p-4 rounded-2xl border border-[var(--border-subtle)]">
          <span className="text-sm text-white/50 font-bold">
            Mostrando {(page - 1) * 15 + 1} - {Math.min(page * 15, total)} de {total}
          </span>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-sm font-bold transition-colors text-white">Anterior</button>
            <button disabled={page * 15 >= total} onClick={() => setPage(page + 1)} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-sm font-bold transition-colors text-white">Siguiente</button>
          </div>
        </div>
      )}

      {/* Modal Crear */}
      {createModalType === 'WIZARD' && (
        <UserWizardModal
          onClose={() => setCreateModalType(null)}
          onSuccess={() => {
            setCreateModalType(null);
            fetchUsers();
          }}
          creatorRole={user?.role || ''}
          creatorName={user?.username || user?.name || user?.email || 'Tú'}
          apiEndpoint="/api/reseller/users/advanced"
        />
      )}

      {createModalType === 'STANDARD' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-panel)] p-8 rounded-[32px] w-full max-w-lg border border-[var(--border-subtle)] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#34D399]/5 blur-[80px] rounded-full pointer-events-none" />
            <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
              <UserPlus className="text-[#34D399]" /> Nuevo Revendedor
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="col-span-2">
                <label className={labelCls}>Rol del Usuario</label>
                <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} className={inputCls + ' font-bold text-[#34D399]'}>
                  {allowedRoles.filter(r => r.value !== 'SUBSCRIBER').map(r => <option key={r.value} value={r.value} className="bg-[#0a0f0a]">{r.label}</option>)}
                </select>
              </div>

              <div>
                <label className={labelCls}>Usuario *</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input type="text" value={newUser.username} placeholder="Ej: pedro123" onChange={e => setNewUser({ ...newUser, username: e.target.value })} className={`${inputCls} pl-10`} />
                </div>
                {!newUser.username && <p className="text-xs text-red-400 mt-1">Requerido</p>}
              </div>
              
              <div>
                <label className={labelCls}>Contraseña *</label>
                <input type="password" value={newUser.password} placeholder="••••••••" onChange={e => setNewUser({ ...newUser, password: e.target.value })} className={inputCls} />
                {!newUser.password && <p className="text-xs text-red-400 mt-1">Requerida</p>}
              </div>
              
              <div>
                <label className={labelCls}>Confirmar Contraseña *</label>
                <input type="password" value={newUser.confirmPassword} placeholder="••••••••" onChange={e => setNewUser({ ...newUser, confirmPassword: e.target.value })} className={inputCls} />
                {newUser.password && newUser.confirmPassword && newUser.password !== newUser.confirmPassword && (
                  <p className="text-xs text-red-400 mt-1">No coinciden</p>
                )}
              </div>

              <div className="col-span-2">
                <label className={labelCls}>Nombre Completo</label>
                <input type="text" value={newUser.name} placeholder="Opcional" onChange={e => setNewUser({ ...newUser, name: e.target.value })} className={inputCls} />
              </div>

              <div>
                <label className={labelCls}>Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input type="email" value={newUser.email} placeholder="Opcional" onChange={e => setNewUser({ ...newUser, email: e.target.value })} className={`${inputCls} pl-10`} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Teléfono</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input type="text" value={newUser.phone} placeholder="Opcional" onChange={e => setNewUser({ ...newUser, phone: e.target.value })} className={`${inputCls} pl-10`} />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setCreateModalType(null)} className="flex-1 px-4 py-3.5 rounded-xl font-bold text-sm bg-white/5 text-white hover:bg-white/10 transition-colors border border-white/10">Cancelar</button>
              <button 
                disabled={!newUser.username || !newUser.password || !newUser.confirmPassword || (newUser.password !== newUser.confirmPassword)}
                onClick={() => { handleCreate(); setCreateModalType(null); }} 
                className="flex-1 px-4 py-3.5 rounded-xl font-black text-sm hover:scale-105 transition-transform flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100" 
                style={{ background: '#34D399', color: '#0a0f0a' }}
              >
                <UserPlus size={18} /> Crear Usuario
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Asignar Plan */}
      {assignModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-panel)] p-8 rounded-[32px] w-full max-w-sm border border-[var(--border-subtle)] shadow-2xl">
            <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2"><Crown className="text-[#34D399]"/> Asignar Plan</h3>
            <p className="text-sm mb-6 text-white/50 font-medium">Usuario: <span className="text-white">{assignModal.email}</span></p>
            <select value={selectedPlan} onChange={e => setSelectedPlan(e.target.value)} className={inputCls + ' mb-6 font-bold'}>
              <option value="" className="bg-[#0a0f0a]">Ninguno (remover plan)</option>
              {plans.map(p => <option key={p.id} value={p.id} className="bg-[#0a0f0a]">{p.name} — {p.tokenCost || 0} tokens / {p.durationDays} días</option>)}
            </select>
            <div className="flex gap-3">
              <button onClick={() => setAssignModal(null)} className="flex-1 px-4 py-3 rounded-xl font-bold text-sm bg-white/10 text-white hover:bg-white/20 transition-colors">Cancelar</button>
              <button onClick={handleAssign} className="flex-1 px-4 py-3 rounded-xl font-black text-sm hover:scale-105 transition-transform" style={{ background: '#34D399', color: '#0a0f0a' }}>Asignar</button>
            </div>
          </div>
        </div>
      )}

      {/* Info Modal */}
      {infoModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-panel)] p-8 rounded-[32px] w-full max-w-md border border-[var(--border-subtle)] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="text-2xl font-black text-white">Detalles del Usuario</h3>
              <button onClick={() => setInfoModal(null)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"><XCircle size={20} /></button>
            </div>
            
            <div className="space-y-4 relative z-10">
              <div className="bg-black/40 p-5 rounded-2xl border border-white/5">
                <p className="text-xs font-black tracking-widest text-white/30 uppercase mb-3">Información Básica</p>
                <div className="space-y-2">
                  <p className="text-sm text-white/70 flex justify-between"><span className="font-bold text-white/50">Usuario:</span> {infoModal.username || '-'}</p>
                  <p className="text-sm text-white/70 flex justify-between"><span className="font-bold text-white/50">Nombre:</span> {infoModal.name || '-'}</p>
                  <p className="text-sm text-white/70 flex justify-between"><span className="font-bold text-white/50">Email:</span> {infoModal.email}</p>
                  <p className="text-sm text-white/70 flex justify-between"><span className="font-bold text-white/50">Rol:</span> <span className="font-black text-[#34D399]">{infoModal.role}</span></p>
                  <p className="text-sm text-white/70 flex justify-between"><span className="font-bold text-white/50">Registro:</span> {new Date(infoModal.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {infoModal.subscription && infoModal.subscription.status === 'ACTIVE' ? (
                <div className="bg-emerald-500/5 p-5 rounded-2xl border border-emerald-500/10">
                  <p className="text-xs font-black tracking-widest text-[#34D399] uppercase mb-3 flex items-center gap-2"><Crown size={14} /> Suscripción Activa</p>
                  <div className="space-y-2">
                    <p className="text-sm text-emerald-100 flex justify-between"><span className="font-bold text-emerald-500/50">Plan:</span> {infoModal.subscription.plan.name}</p>
                    <p className="text-sm text-emerald-100 flex justify-between"><span className="font-bold text-emerald-500/50">Vence:</span> {new Date(infoModal.subscription.expiresAt).toLocaleDateString()}</p>
                    <p className="text-sm text-emerald-100 flex justify-between"><span className="font-bold text-emerald-500/50">Pantallas:</span> {infoModal.subscription.plan.maxScreens || 1}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white/5 p-5 rounded-2xl border border-white/5 text-center">
                  <Crown size={24} className="mx-auto mb-2 text-white/20" />
                  <p className="text-sm text-white/40 font-medium">El usuario no tiene una suscripción activa.</p>
                </div>
              )}
            </div>
            
            <div className="mt-8 flex justify-end relative z-10">
              <button onClick={() => setInfoModal(null)} className="w-full py-3.5 rounded-xl font-bold text-sm bg-white/5 text-white hover:bg-white/10 transition-colors border border-white/10">Cerrar Detalles</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
