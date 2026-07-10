'use client';

import { useEffect, useState } from 'react';
import { Users, Search, ChevronDown, Crown, Shield, User } from 'lucide-react';
import { API, apiFetch } from '@/lib/api';

export default function UsuariosAdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [assignModal, setAssignModal] = useState<{ userId: string; email: string } | null>(null);
  const [selectedPlan, setSelectedPlan] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20', ...(search ? { search } : {}), ...(role ? { role } : {}) });
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

  const handleToggleActive = async (id: string, isActive: boolean) => {
    await apiFetch(API.ADMIN.USER(id), { method: 'PATCH', body: JSON.stringify({ isActive: !isActive }) });
    fetchUsers();
  };

  const ROLE_BADGE: Record<string, { label: string; color: string }> = {
    ADMIN: { label: 'Admin', color: 'var(--clay-red)' },
    SUBSCRIBER: { label: 'Suscripto', color: 'var(--clay-teal)' },
    GUEST: { label: 'Invitado', color: '#6B7280' },
  };

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Users size={24} style={{ color: 'var(--clay-teal)' }} /> Usuarios
          </h1>
          <p className="text-sm text-[#6B7280]">{total} usuarios registrados</p>
        </div>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por email o nombre..." className="clay-input pl-9 text-sm" />
        </div>
        <select value={role} onChange={(e) => setRole(e.target.value)} className="clay-input text-sm w-auto">
          <option value="">Todos los roles</option>
          <option value="GUEST">Invitados</option>
          <option value="SUBSCRIBER">Suscriptos</option>
          <option value="ADMIN">Admins</option>
        </select>
        <button type="submit" className="btn-clay btn-clay-teal btn-clay-sm">Buscar</button>
      </form>

      {/* Table */}
      <div className="clay-card-dark rounded-[16px] overflow-hidden border-[2px] border-[#3A3A5C]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#3A3A5C]" style={{ background: '#1A1A2E' }}>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#6B7280] uppercase">Usuario</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#6B7280] uppercase">Rol</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#6B7280] uppercase">Suscripción</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#6B7280] uppercase">Estado</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-[#6B7280] uppercase">Registro</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-3"><div className="clay-skeleton h-6 rounded" /></td></tr>
                ))
              ) : users.map((u) => {
                const rb = ROLE_BADGE[u.role] || ROLE_BADGE.GUEST;
                return (
                  <tr key={u.id} className="border-b border-[#3A3A5C] hover:bg-white/5 transition-all">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black"
                          style={{ background: 'var(--clay-teal)', color: 'var(--clay-ink)' }}>
                          {u.name?.[0]?.toUpperCase() || u.email?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-xs">{u.name || '—'}</p>
                          <p className="text-[#6B7280] text-[11px]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="clay-badge text-[10px]" style={{ color: rb.color, borderColor: rb.color }}>
                        {rb.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {u.subscription ? (
                        <div>
                          <p className="font-bold text-white">{u.subscription.planName}</p>
                          <p className="text-[#6B7280]">
                            {u.subscription.status === 'ACTIVE'
                              ? `Vence: ${new Date(u.subscription.expiresAt).toLocaleDateString('es-AR')}`
                              : u.subscription.status}
                          </p>
                        </div>
                      ) : (
                        <span className="text-[#3A3A5C]">Sin suscripción</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleToggleActive(u.id, u.isActive)}
                        className="clay-badge text-[10px] cursor-pointer"
                        style={{ color: u.isActive ? 'var(--clay-mint)' : 'var(--clay-red)', borderColor: u.isActive ? 'var(--clay-mint)' : 'var(--clay-red)' }}>
                        {u.isActive ? '● Activo' : '✕ Inactivo'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#6B7280]">
                      {new Date(u.createdAt).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => { setAssignModal({ userId: u.id, email: u.email }); setSelectedPlan(u.subscription?.planId || ''); }}
                        className="btn-clay btn-clay-yellow btn-clay-sm text-[11px]">
                        <Crown size={11} /> Plan
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {users.length === 0 && !loading && (
          <div className="text-center py-12"><Users size={32} className="mx-auto mb-3 text-[#3A3A5C]" /><p className="text-[#6B7280]">Sin usuarios</p></div>
        )}
      </div>

      {/* Assign Plan Modal */}
      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(15,15,26,0.9)', backdropFilter: 'blur(8px)' }}>
          <div className="clay-card-dark p-8 rounded-[24px] w-full max-w-sm border-[3px]"
            style={{ borderColor: 'var(--clay-teal)', boxShadow: '6px 6px 0px var(--clay-teal)' }}>
            <h2 className="text-lg font-black text-white mb-1">Asignar Plan</h2>
            <p className="text-sm text-[#6B7280] mb-6 truncate">{assignModal.email}</p>
            <select value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)} className="clay-input text-sm mb-4">
              <option value="">Sin suscripción</option>
              {plans.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name} — {p.durationDays} días</option>
              ))}
            </select>
            <div className="flex gap-3">
              <button onClick={() => setAssignModal(null)} className="btn-clay btn-clay-dark flex-1 btn-clay-sm">Cancelar</button>
              <button onClick={handleAssignPlan} className="btn-clay btn-clay-teal flex-1 btn-clay-sm">Asignar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
