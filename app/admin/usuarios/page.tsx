'use client';

import { useEffect, useState } from 'react';
import { Users, Search, ChevronDown, Crown, Shield, User, CheckCircle2, XCircle, Copy, Eye, EyeOff } from 'lucide-react';
import { API, apiFetch } from '@/lib/api';

export default function UsuariosAdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [assignModal, setAssignModal] = useState<{ userId: string; email: string; role: string } | null>(null);
  const [createModal, setCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'SUBSCRIBER' });
  const [selectedPlan, setSelectedPlan] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [infoModal, setInfoModal] = useState<any | null>(null);

  const togglePassword = (id: string) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const fetchUsers = async (forceSearch?: string) => {
    setLoading(true);
    const currentSearch = forceSearch !== undefined ? forceSearch : search;
    const params = new URLSearchParams({ limit: '30', ...(currentSearch ? { search: currentSearch } : {}), ...(role ? { role } : {}) });
    const res = await apiFetch(`${API.ADMIN.USERS}?${params}`);
    if (res.success) { setUsers(res.data || []); setTotal(res.meta?.total || 0); }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, [page, role]);
  useEffect(() => {
    apiFetch(API.ADMIN.PLANS).then(res => { if (res.success) setPlans(res.data || []); });
  }, []);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchUsers(); };

  const handleAssignPlan = async () => {
    if (!assignModal || !selectedPlan) return;
    try {
      await apiFetch(API.ADMIN.USER_SUB(assignModal.userId), {
        method: 'POST',
        body: JSON.stringify({ planId: selectedPlan }),
      });
      setAssignModal(null);
      fetchUsers();
    } catch (e: any) { alert(e.message); }
  };

  const handleCreateUser = async () => {
    if (!newUser.username || !newUser.password) return alert('Usuario y contraseña son obligatorios');
    try {
      await apiFetch(`${API.ADMIN.USERS}`, {
        method: 'POST',
        body: JSON.stringify(newUser),
      });
      setCreateModal(false);
      setNewUser({ username: '', password: '', role: 'SUBSCRIBER' });
      fetchUsers();
    } catch (e: any) { alert(e.message); }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    await apiFetch(API.ADMIN.USER(id), { method: 'PATCH', body: JSON.stringify({ isActive: !isActive }) });
    fetchUsers();
  };

  const ROLE_BADGE: Record<string, { label: string; text: string; bg: string; border: string }> = {
    ADMIN: { label: 'Admin', text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    ADMIN_RESELLER: { label: 'Admin Reseller', text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    SUPER_RESELLER: { label: 'Súper Revendedor', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    RESELLER: { label: 'Revendedor', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    SUBSCRIBER: { label: 'Suscripto', text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
    GUEST: { label: 'Invitado', text: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20' },
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Users size={28} style={{ color: 'var(--color-secondary)' }} /> Usuarios
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{total} usuarios registrados</p>
        </div>
        <button onClick={() => setCreateModal(true)} className="px-5 py-2.5 rounded-xl font-bold text-sm bg-[var(--color-primary)] text-black hover:scale-105 transition-transform">
          + Crear Usuario
        </button>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="relative flex-1 lg:w-72">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input value={search} onChange={(e) => {
            setSearch(e.target.value);
            if (e.target.value === '') {
              fetchUsers('');
            }
          }}
            placeholder="Buscar por email o nombre..." 
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2 text-sm text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-colors backdrop-blur-md" 
          />
        </div>
        <select value={role} onChange={(e) => setRole(e.target.value)} className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl px-4 py-2 text-sm font-bold text-white outline-none focus:border-[var(--color-primary)]">
          <option value="">Todos los Roles</option>
          <option value="ADMIN">Admins</option>
          <option value="ADMIN_RESELLER">Admin Resellers</option>
          <option value="SUPER_RESELLER">Súper Revendedores</option>
          <option value="RESELLER">Revendedores</option>
          <option value="SUBSCRIBER">Suscriptores</option>
          <option value="GUEST">Invitados</option>
        </select>
        <button type="submit" className="px-6 py-2.5 rounded-xl font-bold text-sm transition-transform hover:scale-105 active:scale-95 bg-[var(--color-primary)] text-black">
          Buscar
        </button>
      </form>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden border border-[var(--border-subtle)] shadow-2xl backdrop-blur-xl bg-[var(--bg-panel)]">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-black/20">
                <th className="text-left px-4 py-3 text-[13px] font-bold tracking-wider text-white/80 uppercase">Usuario</th>
                <th className="text-left px-4 py-3 text-[13px] font-bold tracking-wider text-white/80 uppercase">Rol</th>
                <th className="text-left px-4 py-3 text-[13px] font-bold tracking-wider text-white/80 uppercase">Suscripción</th>
                <th className="text-left px-4 py-3 text-[13px] font-bold tracking-wider text-white/80 uppercase">Vencimiento</th>
                <th className="text-left px-4 py-3 text-[13px] font-bold tracking-wider text-white/80 uppercase">Conex. / Cuentas</th>
                <th className="text-left px-4 py-3 text-[13px] font-bold tracking-wider text-white/80 uppercase">Créditos</th>
                <th className="text-left px-4 py-3 text-[13px] font-bold tracking-wider text-white/80 uppercase">Estado</th>
                <th className="text-right px-4 py-3 text-[13px] font-bold tracking-wider text-white/80 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5"><td colSpan={8} className="px-5 py-4"><div className="h-10 bg-white/5 rounded-lg animate-pulse w-full" /></td></tr>
                ))
              ) : users.map((u) => {
                const rb = ROLE_BADGE[u.role] || ROLE_BADGE.GUEST;
                const isSubActive = u.subscription?.status === 'ACTIVE';
                return (
                  <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm bg-black/20 ${rb.text}`}>
                          {u.email.substring(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white text-[13px] flex items-center gap-2">
                            {u.username || u.email}
                            <button onClick={() => navigator.clipboard.writeText(u.username || u.email)} className="text-[var(--text-muted)] hover:text-white transition-colors" title="Copiar usuario">
                              <Copy size={12} />
                            </button>
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] font-mono text-[var(--color-primary)]">
                              Contraseña: {u.plainPassword ? (visiblePasswords[u.id] ? u.plainPassword : '••••••••') : '••••••••'}
                            </span>
                            {u.plainPassword && (
                              <>
                                <button onClick={() => togglePassword(u.id)} className="text-[var(--text-muted)] hover:text-white transition-colors" title={visiblePasswords[u.id] ? 'Ocultar' : 'Mostrar'}>
                                  {visiblePasswords[u.id] ? <EyeOff size={12} /> : <Eye size={12} />}
                                </button>
                                <button onClick={() => navigator.clipboard.writeText(u.plainPassword)} className="text-[var(--text-muted)] hover:text-white transition-colors" title="Copiar contraseña">
                                  <Copy size={12} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border transition-colors ${rb.bg} ${rb.text} ${rb.border}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isSubActive ? (
                        <div className="flex items-center gap-2">
                          <Crown size={14} className="text-[var(--color-primary)]" />
                          <span className="text-white font-bold text-[13px]">{u.subscription?.planName || 'Plan'}</span>
                        </div>
                      ) : (
                        <span className="text-[var(--text-muted)] text-[12px]">Sin suscripción</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isSubActive && u.subscription?.expiresAt ? (
                        <span className="text-[12px] font-bold text-white/90">
                          {new Date(u.subscription.expiresAt).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-[var(--text-muted)] text-[12px]">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {(u.role === 'RESELLER' || u.role === 'SUBSCRIBER') && (
                        <span className="text-[12px] font-bold text-white/90">
                            {u.activeClients !== undefined ? u.activeClients : 0} Activas
                        </span>
                      )}
                      {u.role === 'ADMIN' && (
                        <span className="text-[var(--text-muted)] text-[12px]">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                        <span className="text-[12px] font-bold text-[var(--color-primary)]">{u.tokens || 0}</span>
                    </td>
                    <td className="px-4 py-3">
                      {u.isActive ? (
                        <span className="text-green-400 font-bold flex items-center gap-1.5 text-[12px]"><CheckCircle2 size={14}/> Activo</span>
                      ) : (
                        <span className="text-red-400 font-bold flex items-center gap-1.5 text-[12px]"><XCircle size={14}/> Baneado</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setInfoModal(u)}
                          className="px-3 py-2 rounded-xl text-xs font-bold bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors inline-flex items-center justify-center gap-2"
                          title="Ver Detalles">
                          <Eye size={14} /> Detalles
                        </button>
                        <button onClick={() => handleToggleActive(u.id, u.isActive)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors inline-flex items-center justify-center ${u.isActive ? 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20' : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'}`}
                          title={u.isActive ? 'Suspender acceso' : 'Activar acceso'}>
                          {u.isActive ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                        </button>
                        <button onClick={() => { setAssignModal({ userId: u.id, email: u.email, role: u.role }); setSelectedPlan(u.subscription?.planId || ''); }}
                          className="px-3 py-2 rounded-xl text-xs font-bold bg-white/10 text-white hover:bg-white/20 transition-colors inline-flex items-center justify-center gap-2">
                          <Crown size={14} /> Plan
                        </button>
                        <button onClick={async () => {
                            if (window.confirm('¿Seguro que deseas eliminar este usuario? Esto es irreversible y bloqueará su acceso.')) {
                              try {
                                await apiFetch(API.ADMIN.USER(u.id), { method: 'DELETE' });
                                fetchUsers();
                              } catch (e: any) { alert(e.message); }
                            }
                          }}
                          className="px-3 py-2 rounded-xl text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors inline-flex items-center justify-center">
                          <XCircle size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {users.length === 0 && !loading && (
          <div className="text-center py-16"><Users size={48} className="mx-auto mb-4 text-[var(--text-muted)] opacity-50" /><p className="text-[var(--text-muted)]">Sin usuarios</p></div>
        )}
      </div>

      {/* Modal Asignar Plan */}
      {assignModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-panel)] p-8 rounded-[24px] w-full max-w-sm border border-[var(--border-subtle)] backdrop-blur-xl shadow-2xl">
            <h3 className="text-xl font-black text-white mb-2">Asignar Plan</h3>
            <p className="text-sm text-white/60 mb-6">Usuario: {assignModal.email}</p>
            
            <select value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)} 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors mb-6">
              <option value="" className="bg-black">Ninguno (Remover)</option>
              {plans.filter(p => assignModal.role === 'ADMIN' || (['RESELLER', 'SUPER_RESELLER', 'ADMIN_RESELLER'].includes(assignModal.role) && p.role === 'RESELLER') || p.role === assignModal.role).map(p => (
                <option key={p.id} value={p.id} className="bg-black">{p.name} ({p.role} - {p.tier})</option>
              ))}
            </select>

            <div className="flex gap-3 mt-4">
              <button onClick={() => setAssignModal(null)} className="px-4 py-3 rounded-xl font-bold text-sm bg-white/10 text-white hover:bg-white/20 transition-colors flex-1">Cancelar</button>
              <button onClick={handleAssignPlan} className="px-4 py-3 rounded-xl font-bold text-sm bg-[var(--color-primary)] text-black hover:scale-105 transition-transform flex-1">Asignar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear Usuario */}
      {createModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-panel)] p-8 rounded-[24px] w-full max-w-sm border border-[var(--border-subtle)] backdrop-blur-xl shadow-2xl">
            <h3 className="text-xl font-black text-white mb-6">Crear Nuevo Usuario</h3>
            
            <input type="text" placeholder="Nombre de usuario" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[var(--color-primary)] mb-3 outline-none" />
            <input type="text" placeholder="Contraseña" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[var(--color-primary)] mb-3 outline-none" />
            
            <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[var(--color-primary)] mb-6 outline-none font-bold text-[var(--color-primary)]">
              <option value="ADMIN">Administrador General</option>
              <option value="ADMIN_RESELLER">Admin Reseller</option>
              <option value="SUPER_RESELLER">Súper Revendedor</option>
              <option value="RESELLER">Revendedor</option>
              <option value="SUBSCRIBER">Cliente (Suscriptor)</option>
              <option value="GUEST">Invitado</option>
            </select>

            <div className="flex gap-3 mt-4">
              <button onClick={() => setCreateModal(false)} className="px-4 py-3 rounded-xl font-bold text-sm bg-white/10 text-white hover:bg-white/20 transition-colors flex-1">Cancelar</button>
              <button onClick={handleCreateUser} className="px-4 py-3 rounded-xl font-bold text-sm bg-[var(--color-primary)] text-black hover:scale-105 transition-transform flex-1">Crear</button>
            </div>
          </div>
        </div>
      )}

      {/* Info Modal */}
      {infoModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-panel)] p-8 rounded-[24px] w-full max-w-md border border-[var(--border-subtle)] backdrop-blur-xl shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-white">Detalles del Usuario</h3>
              <button onClick={() => setInfoModal(null)} className="text-white/40 hover:text-white"><XCircle size={24} /></button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                <p className="text-xs font-bold text-white/50 mb-1">Información Básica</p>
                <p className="text-sm text-white"><span className="font-bold">Email:</span> {infoModal.email}</p>
                <p className="text-sm text-white"><span className="font-bold">Usuario:</span> {infoModal.username || '-'}</p>
                <p className="text-sm text-white"><span className="font-bold">Rol:</span> {infoModal.role}</p>
                <p className="text-sm text-white"><span className="font-bold">Registro:</span> {new Date(infoModal.createdAt).toLocaleDateString()}</p>
                <p className="text-sm text-white"><span className="font-bold">Tokens Balance:</span> {infoModal.tokens || 0}</p>
              </div>

              {infoModal.subscription && infoModal.subscription.status === 'ACTIVE' ? (
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <p className="text-xs font-bold text-[var(--color-primary)] mb-1 flex items-center gap-2"><Crown size={14} /> Suscripción Activa</p>
                  <p className="text-sm text-white"><span className="font-bold">Plan:</span> {infoModal.subscription.planName}</p>
                  <p className="text-sm text-white"><span className="font-bold">Vence:</span> {new Date(infoModal.subscription.expiresAt).toLocaleDateString()}</p>
                  {infoModal.role === 'SUBSCRIBER' && (
                    <p className="text-sm text-white"><span className="font-bold">Pantallas Permitidas:</span> {infoModal.subscription.maxScreens || 1}</p>
                  )}
                  {infoModal.role === 'RESELLER' && (
                    <p className="text-sm text-white"><span className="font-bold">Límite Suscriptores:</span> {infoModal.subscription.maxSubscribers || 'Ilimitados'}</p>
                  )}
                </div>
              ) : (
                <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-center">
                  <p className="text-sm text-white/50">El usuario no tiene una suscripción activa.</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button onClick={() => setInfoModal(null)} className="px-6 py-2 rounded-xl font-bold text-sm bg-white/10 text-white hover:bg-white/20 transition-colors">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
