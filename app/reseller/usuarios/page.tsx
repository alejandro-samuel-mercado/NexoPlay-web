'use client';

import { useEffect, useState, Suspense } from 'react';
import { Users, Search, ChevronDown, Crown, Shield, User, CheckCircle2, XCircle, Copy, Eye, EyeOff, UserPlus, RefreshCcw, Edit2 } from 'lucide-react';
import { API_BASE, apiFetch } from '@/lib/api';
import { useSearchParams } from 'next/navigation';
import UserWizardModal from '@/components/admin/UserWizardModal';
import { useAuth } from '@/context/AuthContext';

const R = (path: string) => `${API_BASE}/api/reseller${path}`;

function ResellerUsuariosContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as 'Resellers' | 'Clients' | null;
  const { user } = useAuth();

  const [users, setUsers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Tabs
  const canSeeResellers = user?.role === 'SUPER_RESELLER' || user?.role === 'ADMIN_RESELLER';
  const initialTab = tabParam || (canSeeResellers ? 'Resellers' : 'Clients');
  const [mainTab, setMainTab] = useState<'Resellers' | 'Clients'>(initialTab as 'Resellers' | 'Clients');
  
  // Si es ADMIN_RESELLER su rol default en la pestaña Resellers puede ser SUPER_RESELLER.
  // Si es SUPER_RESELLER su rol default en la pestaña Resellers es RESELLER.
  const getInitialRole = (tab: 'Resellers'|'Clients') => {
    if (tab === 'Clients') return 'SUBSCRIBER';
    if (user?.role === 'ADMIN_RESELLER') return 'SUPER_RESELLER';
    return 'RESELLER';
  };

  const [role, setRole] = useState(getInitialRole(initialTab as 'Resellers'|'Clients'));
  const [clientType, setClientType] = useState<'regular' | 'trial'>('regular');
  
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [assignModal, setAssignModal] = useState<{ userId: string; email: string; role: string } | null>(null);
  const [createModalType, setCreateModalType] = useState<'WIZARD' | 'WIZARD_RESELLERS' | null>(null);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [infoModal, setInfoModal] = useState<any | null>(null);
  const [editModal, setEditModal] = useState<{ id: string; username: string; name: string; password?: string; isActive: boolean } | null>(null);

  const togglePassword = (id: string) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const fetchUsers = async (forceSearch?: string) => {
    setLoading(true);
    const currentSearch = forceSearch !== undefined ? forceSearch : search;
    const params = new URLSearchParams({ limit: '15', page: page.toString(), ...(currentSearch ? { search: currentSearch } : {}), ...(role ? { role } : {}) });
    if (mainTab === 'Clients') params.append('clientType', clientType);
    const res = await apiFetch(R(`/users?${params}`));
    if (res.success) { setUsers(res.data || []); setTotal(res.meta?.total || 0); }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, [page, role, clientType, mainTab]);
  
  useEffect(() => {
    apiFetch(`${API_BASE}/api/tokens/plans`).then(res => { 
      if (res.success) setPlans(res.data || []); 
    });
  }, []);

  useEffect(() => {
    if (tabParam === 'Resellers' && canSeeResellers) {
      setMainTab('Resellers');
      setRole(getInitialRole('Resellers'));
    } else {
      setMainTab('Clients');
      setRole('SUBSCRIBER');
      setClientType('regular');
    }
  }, [tabParam, user]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchUsers(); };

  const handleAssignPlan = async () => {
    if (!assignModal) return;
    try {
      let res;
      if (selectedPlan) {
        res = await apiFetch(R(`/users/${assignModal.userId}/subscription`), { method: 'POST', body: JSON.stringify({ planId: selectedPlan }) });
      } else {
        res = await apiFetch(R(`/users/${assignModal.userId}/subscription`), { method: 'POST', body: JSON.stringify({ planId: "" }) });
      }
      if (res.success) { setAssignModal(null); fetchUsers(); }
      else alert(res.error || 'Error al asignar plan');
    } catch (e: any) { alert(e.message); }
  };

  const handleEditUser = async () => {
    if (!editModal) return;
    try {
      const res = await apiFetch(R(`/users/${editModal.id}`), {
        method: 'PATCH',
        body: JSON.stringify({
          username: editModal.username,
          name: editModal.name,
          password: editModal.password || undefined,
          isActive: editModal.isActive
        })
      });
      if (res.success) {
        setEditModal(null);
        fetchUsers();
      } else {
        alert(res.error || 'Error al editar usuario');
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    await apiFetch(R(`/users/${id}`), { method: 'PATCH', body: JSON.stringify({ isActive: !isActive }) });
    fetchUsers();
  };

  const ROLE_BADGE: Record<string, { label: string; text: string; bg: string; border: string }> = {
    ADMIN_RESELLER: { label: 'Admin Revendedores', text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    SUPER_RESELLER: { label: 'Súper Revendedor', text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    RESELLER: { label: 'Revendedor', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    SUBSCRIBER: { label: 'Suscripto', text: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Users size={28} style={{ color: '#34D399' }} /> Usuarios
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{total} usuarios en tu red</p>
        </div>
        <button onClick={() => setCreateModalType(mainTab === 'Clients' ? 'WIZARD' : 'WIZARD_RESELLERS')} 
          className="bg-[#34D399] text-black px-6 py-3 rounded-2xl font-black hover:scale-105 transition-transform flex items-center gap-2 shadow-[0_0_20px_rgba(52,211,153,0.3)]">
          <UserPlus size={18} />
          {mainTab === 'Resellers' ? 'Crear Revendedor' : 'Crear Cliente Final'}
        </button>
      </div>

      {/* Search and Sub Tabs */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        {/* Search */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <form onSubmit={handleSearch} className="relative flex-1 lg:w-72">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input value={search} onChange={(e) => {
              setSearch(e.target.value);
              if (e.target.value === '') fetchUsers('');
            }}
              placeholder="Buscar por email o nombre..." 
              className="w-full bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-xl pl-11 pr-4 py-2 text-sm text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[#34D399] transition-colors backdrop-blur-md" 
            />
          </form>
          <button 
            onClick={() => fetchUsers(search)} 
            disabled={loading}
            className="p-2.5 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] text-white hover:text-[#34D399] hover:border-[#34D399] transition-all flex items-center justify-center disabled:opacity-50"
            title="Refrescar"
          >
            <RefreshCcw size={18} className={loading ? 'animate-spin text-[#34D399]' : ''} />
          </button>
        </div>

      </div>

      {/* Role specific sub-tabs if we are in Resellers tab */}
      {mainTab === 'Resellers' && canSeeResellers && (
        <div className="flex gap-2 mb-4 bg-[var(--bg-panel)] border border-[var(--border-subtle)] p-1 rounded-xl w-fit">
          {user?.role === 'ADMIN_RESELLER' && (
            <button onClick={() => { setRole('SUPER_RESELLER'); setPage(1); }} className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${role === 'SUPER_RESELLER' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/80'}`}>Súper Revendedores</button>
          )}
          <button onClick={() => { setRole('RESELLER'); setPage(1); }} className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${role === 'RESELLER' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/80'}`}>Revendedores Normales</button>
        </div>
      )}

      {/* Client type sub-tabs if we are in Clients tab */}
      {mainTab === 'Clients' && (
        <div className="flex gap-2 mb-4 bg-[var(--bg-panel)] border border-[var(--border-subtle)] p-1 rounded-xl w-fit">
          <button onClick={() => { setClientType('regular'); setPage(1); }} className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${clientType === 'regular' ? 'bg-[#34D399]/20 text-[#34D399] shadow-sm' : 'text-white/40 hover:text-white/80'}`}>Cuentas normales</button>
          <button onClick={() => { setClientType('trial'); setPage(1); }} className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${clientType === 'trial' ? 'bg-[#34D399]/20 text-[#34D399] shadow-sm' : 'text-white/40 hover:text-white/80'}`}>Cuentas de Prueba</button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl overflow-hidden border border-[var(--border-subtle)] shadow-2xl backdrop-blur-xl bg-[var(--bg-panel)]">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-black/20">
                <th className="text-left px-4 py-3 text-[13px] font-bold tracking-wider text-white/80 uppercase">Usuario</th>
                <th className="text-left px-4 py-3 text-[13px] font-bold tracking-wider text-white/80 uppercase">Creado</th>
                <th className="text-left px-4 py-3 text-[13px] font-bold tracking-wider text-white/80 uppercase">Suscripción</th>
                <th className="text-left px-4 py-3 text-[13px] font-bold tracking-wider text-white/80 uppercase">Vencimiento</th>
                <th className="text-left px-4 py-3 text-[13px] font-bold tracking-wider text-white/80 uppercase">{mainTab === 'Clients' ? 'Pantallas Activas' : 'Cuentas Activas'}</th>
                <th className="text-left px-4 py-3 text-[13px] font-bold tracking-wider text-white/80 uppercase">Créditos</th>
                <th className="text-left px-4 py-3 text-[13px] font-bold tracking-wider text-white/80 uppercase">Estado</th>
                <th className="text-right px-4 py-3 text-[13px] font-bold tracking-wider text-white/80 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className={`transition-opacity duration-200 ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
              {users.map((u) => {
                const rb = ROLE_BADGE[u.role] || ROLE_BADGE.SUBSCRIBER;
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
                            <span className="text-[11px] font-mono text-[#34D399]">
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
                      <span className="text-[12px] font-bold text-white/80">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {isSubActive ? (
                        <div className="flex items-center gap-2">
                          <Crown size={14} className="text-[#34D399]" />
                          <span className="text-white font-bold text-[13px]">{u.subscription?.plan?.name || 'Plan'}</span>
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
                      <span className="text-[12px] font-bold text-white/90">
                          {u.activeClients !== undefined ? u.activeClients : 0} Activas
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[12px] font-bold text-[#34D399]">{u.tokens || 0}</span>
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
                        <button onClick={() => setEditModal({ id: u.id, username: u.username || '', name: u.name || '', password: '', isActive: u.isActive, planId: u.subscription?.planId || '' })}
                          className="px-3 py-2 rounded-xl text-xs font-bold bg-white/10 text-white hover:bg-white/20 transition-all hover:scale-105 inline-flex items-center justify-center gap-2"
                          title="Editar usuario">
                          <Edit2 size={14} /> Editar
                        </button>
                        <button onClick={() => { setAssignModal({ userId: u.id, email: u.email, role: u.role }); setSelectedPlan(u.subscription?.planId || ''); }}
                          className="px-3 py-2 rounded-xl text-xs font-bold bg-white/10 text-white hover:bg-white/20 transition-all hover:scale-105 inline-flex items-center justify-center gap-2">
                          <Crown size={14} /> Plan
                        </button>
                        <button onClick={() => handleToggleActive(u.id, u.isActive)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 inline-flex items-center justify-center gap-2 ${u.isActive ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-green-500 text-white shadow-lg shadow-green-500/20'}`}
                          title={u.isActive ? 'Suspender acceso' : 'Activar acceso'}>
                          {u.isActive ? <><XCircle size={14} /> Desactivar</> : <><CheckCircle2 size={14} /> Activar</>}
                        </button>
                        <button onClick={async () => {
                            if (window.confirm('¿Seguro que deseas eliminar este usuario? Esto es irreversible y bloqueará su acceso.')) {
                              try {
                                await API.RESELLER.deleteUser(u.id);
                                fetchUsers();
                              } catch (e: any) { alert(e.message); }
                            }
                          }} 
                          className="px-3 py-2 rounded-xl text-xs font-bold bg-red-500 text-white shadow-lg shadow-red-500/20 hover:scale-105 transition-all inline-flex items-center justify-center gap-2"
                          title="Eliminar usuario">
                          <XCircle size={14} /> Eliminar
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

      {/* Modal Asignar Plan */}
      {assignModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-panel)] p-8 rounded-[24px] w-full max-w-sm border border-[var(--border-subtle)] backdrop-blur-xl shadow-2xl">
            <h3 className="text-xl font-black text-white mb-2">Asignar Plan</h3>
            <p className="text-sm text-white/60 mb-6">Usuario: {assignModal.email}</p>
            
            <p className="text-xs text-[#EAB308] font-bold mb-2 uppercase">IMPORTANTE: Asignar un plan descontará los créditos correspondientes de tu cuenta.</p>
            
            <select value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)} 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#34D399] transition-colors mb-6">
              <option value="" className="bg-black">Ninguno (Remover)</option>
              {plans.filter(p => (['RESELLER', 'SUPER_RESELLER', 'ADMIN_RESELLER'].includes(assignModal.role) && p.role === 'RESELLER') || p.role === assignModal.role).map(p => (
                <option key={p.id} value={p.id} className="bg-black">{p.name} ({p.tokenCost || 0} créditos)</option>
              ))}
            </select>

            <div className="flex gap-3 mt-4">
              <button onClick={() => setAssignModal(null)} className="px-4 py-3 rounded-xl font-bold text-sm bg-white/10 text-white hover:bg-white/20 transition-colors flex-1">Cancelar</button>
              <button onClick={handleAssignPlan} className="px-4 py-3 rounded-xl font-bold text-sm bg-[#34D399] text-black hover:scale-105 transition-transform flex-1">Asignar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear Usuario */}
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
          mode="USERS"
        />
      )}

      {createModalType === 'WIZARD_RESELLERS' && (
        <UserWizardModal
          onClose={() => setCreateModalType(null)}
          onSuccess={() => {
            setCreateModalType(null);
            fetchUsers();
          }}
          creatorRole={user?.role || ''}
          creatorName={user?.username || user?.name || user?.email || 'Tú'}
          apiEndpoint="/api/reseller/users/advanced"
          mode="RESELLERS"
        />
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-panel)] p-8 rounded-[24px] w-full max-w-sm border border-[var(--border-subtle)] backdrop-blur-xl shadow-2xl">
            <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2"><Edit2 size={24} className="text-[#34D399]"/> Editar Usuario</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-white/50 mb-1 block">Usuario</label>
                <input type="text" value={editModal.username} onChange={e => setEditModal({...editModal, username: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#34D399] outline-none" />
              </div>
              
              <div>
                <label className="text-xs font-bold text-white/50 mb-1 block">Nombre Completo (Opcional)</label>
                <input type="text" value={editModal.name} onChange={e => setEditModal({...editModal, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#34D399] outline-none" />
              </div>

              <div>
                <label className="text-xs font-bold text-white/50 mb-1 block">Contraseña (Dejar en blanco para no cambiar)</label>
                <input type="text" placeholder="Nueva contraseña" value={editModal.password || ''} onChange={e => setEditModal({...editModal, password: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#34D399] outline-none" />
              </div>
              
              <div>
                <label className="text-xs font-bold text-white/50 mb-1 block">Estado</label>
                <select value={editModal.isActive ? 'true' : 'false'} onChange={e => setEditModal({ ...editModal, isActive: e.target.value === 'true' })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#34D399] outline-none font-bold text-[#34D399]">
                  <option value="true">Activo</option>
                  <option value="false">Suspendido</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setEditModal(null)} className="px-4 py-3 rounded-xl font-bold text-sm bg-white/10 text-white hover:bg-white/20 transition-colors flex-1">Cancelar</button>
              <button 
                onClick={handleEditUser} 
                className="px-4 py-3 rounded-xl font-bold text-sm bg-[#34D399] text-black hover:scale-105 transition-transform flex-1"
              >
                Guardar
              </button>
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
              </div>

              {infoModal.subscription && infoModal.subscription.status === 'ACTIVE' ? (
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                  <p className="text-xs font-bold text-[#34D399] mb-1 flex items-center gap-2"><Crown size={14} /> Suscripción Activa</p>
                  <p className="text-sm text-white"><span className="font-bold">Plan:</span> {infoModal.subscription.plan?.name || 'Plan activo'}</p>
                  <p className="text-sm text-white"><span className="font-bold">Vence:</span> {new Date(infoModal.subscription.expiresAt).toLocaleDateString()}</p>
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

export default function ResellerUsuariosPage() {
  return (
    <Suspense fallback={<div className="p-8 flex justify-center"><div className="w-8 h-8 rounded-full border-4 border-[#34D399] border-t-transparent animate-spin" /></div>}>
      <ResellerUsuariosContent />
    </Suspense>
  );
}
