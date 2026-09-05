'use client';

import { useState, useEffect } from 'react';
import { UserPlus, User, Lock, Mail, Phone, Clock, Coins, MonitorPlay, CheckCircle2, ChevronRight, ChevronLeft, Loader2, Crown } from 'lucide-react';
import { apiFetch, API_BASE } from '@/lib/api';

interface UserWizardModalProps {
  onClose: () => void;
  onSuccess: () => void;
  creatorRole: string; // 'ADMIN' | 'RESELLER' | 'SUPER_RESELLER' | 'ADMIN_RESELLER'
  creatorName?: string;
  apiEndpoint: string; // '/api/admin/users/advanced' or '/api/reseller/users/advanced'
}

export default function UserWizardModal({ onClose, onSuccess, creatorRole, creatorName = 'Tú', apiEndpoint }: UserWizardModalProps) {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<'TRIAL' | 'SUBSCRIBER'>('TRIAL');
  
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    phone: '',
    durationHours: 1,
    maxScreens: 3,
    credits: 0,
    planId: ''
  });

  const [plans, setPlans] = useState<any[]>([]);

  const [creatorBalance, setCreatorBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch(`${API_BASE}/api/auth/me`).then(res => {
      if (res.success && res.data?.wallet) {
        setCreatorBalance(res.data.wallet.balance);
      }
    });
    apiFetch(`${API_BASE}/api/tokens/plans`).then(r => {
      if (r.success) {
        setPlans(r.data.filter((p: any) => p.role === 'SUBSCRIBER' && p.isActive && !p.name.toUpperCase().includes('PRUEBA')));
      }
    });
  }, []);

  const isStep2Valid = formData.username && formData.password && formData.confirmPassword && (formData.password === formData.confirmPassword);
  
  const handleNext = () => {
    if (step === 2) {
      if (!isStep2Valid) return;
      const planCost = plans.find(p => p.id === formData.planId)?.tokenCost || 0;
      const totalCost = formData.credits + planCost;
      if (type === 'SUBSCRIBER' && creatorRole !== 'ADMIN' && totalCost > creatorBalance) {
        setError(`Créditos insuficientes. Tienes ${creatorBalance} y necesitas ${totalCost}`);
        return;
      }
    }
    setError('');
    setStep(p => p + 1);
  };

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    
    try {
      const res = await apiFetch(`${API_BASE}${apiEndpoint}`, {
        method: 'POST',
        body: JSON.stringify({
          type,
          ...formData
        })
      });

      if (res.success) {
        onSuccess();
      } else {
        setError(res.error || 'Ocurrió un error');
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[var(--bg-panel)] rounded-[32px] w-full max-w-2xl border border-[var(--border-subtle)] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-primary)] opacity-5 blur-[80px] rounded-full pointer-events-none" />
        
        {/* Header */}
        <div className="p-6 border-b border-[var(--border-subtle)] flex items-center gap-4 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
            <UserPlus size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white">Crear Usuario</h3>
            <p className="text-white/50 text-sm">Paso {step} de 3</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold">
              {error}
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-6">
              <h4 className="text-lg font-bold text-white mb-4">¿Qué tipo de cuenta deseas crear?</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setType('TRIAL')}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${type === 'TRIAL' ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'border-white/10 hover:border-white/20'}`}
                >
                  <Clock size={32} className={`mb-4 ${type === 'TRIAL' ? 'text-[var(--color-primary)]' : 'text-white/40'}`} />
                  <h5 className="text-white font-bold text-lg mb-2">Cuenta de Prueba</h5>
                  <p className="text-sm text-white/50">Por horas. No consume créditos.</p>
                </button>
                <button
                  onClick={() => setType('SUBSCRIBER')}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${type === 'SUBSCRIBER' ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5' : 'border-white/10 hover:border-white/20'}`}
                >
                  <User size={32} className={`mb-4 ${type === 'SUBSCRIBER' ? 'text-[var(--color-primary)]' : 'text-white/40'}`} />
                  <h5 className="text-white font-bold text-lg mb-2">Cliente Final (Normal)</h5>
                  <p className="text-sm text-white/50">Puedes asignarle créditos. Consume de tu saldo.</p>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-white/60 mb-2 block uppercase tracking-wider">Usuario *</label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                    <input type="text" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} placeholder="Ej: maria123" className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:border-[var(--color-primary)] focus:outline-none transition-colors" />
                  </div>
                  {!formData.username && <p className="text-xs text-red-400 mt-1">El usuario es obligatorio</p>}
                </div>
                <div>
                  <label className="text-xs font-bold text-white/60 mb-2 block uppercase tracking-wider">Contraseña *</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                    <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder="••••••••" className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:border-[var(--color-primary)] focus:outline-none transition-colors" />
                  </div>
                  {!formData.password && <p className="text-xs text-red-400 mt-1">La contraseña es obligatoria</p>}
                </div>
                <div>
                  <label className="text-xs font-bold text-white/60 mb-2 block uppercase tracking-wider">Confirmar Contraseña *</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                    <input type="password" value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} placeholder="••••••••" className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:border-[var(--color-primary)] focus:outline-none transition-colors" />
                  </div>
                  {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-xs text-red-400 mt-1">Las contraseñas no coinciden</p>
                  )}
                  {!formData.confirmPassword && <p className="text-xs text-red-400 mt-1">Debes confirmar la contraseña</p>}
                </div>
                <div>
                  <label className="text-xs font-bold text-white/60 mb-2 block uppercase tracking-wider">Nombre Completo</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Opcional" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[var(--color-primary)] focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-bold text-white/60 mb-2 block uppercase tracking-wider">Teléfono / WhatsApp</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                    <input type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="Opcional" className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:border-[var(--color-primary)] focus:outline-none transition-colors" />
                  </div>
                </div>
              </div>

              <hr className="border-white/10" />

              {type === 'TRIAL' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-white/60 mb-2 block uppercase tracking-wider">Duración de la Prueba</label>
                    <div className="relative">
                      <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                      <select value={formData.durationHours} onChange={e => setFormData({ ...formData, durationHours: Number(e.target.value) })} className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:border-[var(--color-primary)] focus:outline-none transition-colors appearance-none">
                        <option value={1} className="bg-gray-900">1 Hora</option>
                        <option value={6} className="bg-gray-900">6 Horas</option>
                        <option value={12} className="bg-gray-900">12 Horas</option>
                        <option value={24} className="bg-gray-900">24 Horas</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-white/60 mb-2 block uppercase tracking-wider">Conexiones Máximas</label>
                    <div className="relative">
                      <MonitorPlay size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                      <input type="number" min="1" max="10" value={formData.maxScreens} onChange={e => setFormData({ ...formData, maxScreens: Number(e.target.value) })} className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:border-[var(--color-primary)] focus:outline-none transition-colors" />
                    </div>
                  </div>
                </div>
              )}

              {type === 'SUBSCRIBER' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-white/60 mb-2 flex items-center justify-between uppercase tracking-wider">
                      <span>Créditos a Asignar</span>
                      <span className="text-[var(--color-primary)] normal-case">Saldo: {creatorBalance}</span>
                    </label>
                    <div className="relative">
                      <Coins size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-primary)]" />
                      <input type="number" min="0" value={formData.credits} onChange={e => setFormData({ ...formData, credits: Number(e.target.value) })} className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white font-bold focus:border-[var(--color-primary)] focus:outline-none transition-colors" />
                    </div>
                    <p className="text-xs text-white/40 mt-2">Los créditos asignados se descontarán de tu saldo.</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-white/60 mb-2 block uppercase tracking-wider">Conexiones Máximas (Por Defecto 3)</label>
                    <div className="relative">
                      <MonitorPlay size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                      <input type="number" min="1" max="10" value={formData.maxScreens} onChange={e => setFormData({ ...formData, maxScreens: Number(e.target.value) })} className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:border-[var(--color-primary)] focus:outline-none transition-colors" />
                    </div>
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <label className="text-xs font-bold text-white/60 mb-2 block uppercase tracking-wider">Plan (Opcional)</label>
                    <div className="relative">
                      <Crown size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-primary)]" />
                      <select value={formData.planId} onChange={e => setFormData({ ...formData, planId: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:border-[var(--color-primary)] focus:outline-none transition-colors appearance-none">
                        <option value="" className="bg-gray-900">Sin plan (Por defecto)</option>
                        {plans.map(p => (
                          <option key={p.id} value={p.id} className="bg-gray-900">{p.name} {creatorRole !== 'ADMIN' ? `— ${p.tokenCost || 0} créditos` : ''}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-6">
              

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs font-bold text-[var(--color-primary)] uppercase mb-1">Creado Por</p>
                  <p className="text-white font-bold">{creatorName}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs font-bold text-white/40 uppercase mb-1">Tipo de Cuenta</p>
                  <p className="text-white font-bold">{type === 'TRIAL' ? 'Prueba (Gratuita)' : 'Cliente Final (Suscriptor)'}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <p className="text-xs font-bold text-white/40 uppercase mb-1">Usuario</p>
                  <p className="text-white font-bold">{formData.username}</p>
                </div>
                {type === 'TRIAL' && (
                  <div className="col-span-2 p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-xs font-bold text-white/40 uppercase mb-1">Duración y Pantallas</p>
                    <p className="text-white font-bold">{formData.durationHours} Horas / {formData.maxScreens} Pantallas</p>
                  </div>
                )}
                {type === 'SUBSCRIBER' && (
                  <>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-xs font-bold text-white/40 uppercase mb-1">Plan Asignado</p>
                      <p className="text-white font-bold">{formData.planId ? plans.find(p => p.id === formData.planId)?.name : 'Sin plan'}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <p className="text-xs font-bold text-white/40 uppercase mb-1">Pantallas Máximas</p>
                      <p className="text-white font-bold">{formData.planId ? plans.find(p => p.id === formData.planId)?.maxScreens || formData.maxScreens : formData.maxScreens}</p>
                    </div>
                  </>
                )}
              </div>

              <div className="p-4 rounded-xl border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/60">Tus Créditos Actuales:</span>
                  <span className="font-bold text-white">{creatorBalance}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/60">Costo de esta operación:</span>
                  <span className="font-bold text-red-400">-{type === 'TRIAL' || creatorRole === 'ADMIN' ? 0 : formData.credits + (plans.find(p => p.id === formData.planId)?.tokenCost || 0)}</span>
                </div>
                <hr className="border-[var(--color-primary)]/20" />
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">Tus Créditos Finales:</span>
                  <span className="font-black text-lg text-[var(--color-primary)]">{creatorBalance - (type === 'TRIAL' || creatorRole === 'ADMIN' ? 0 : formData.credits + (plans.find(p => p.id === formData.planId)?.tokenCost || 0))}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[var(--border-subtle)] flex gap-4 shrink-0 bg-black/20">
          <button 
            onClick={step === 1 ? onClose : () => setStep(p => p - 1)}
            disabled={loading}
            className="flex-1 px-6 py-3 rounded-xl font-bold text-sm text-white bg-white/5 hover:bg-white/10 transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {step === 1 ? 'Cancelar' : <><ChevronLeft size={16} /> Volver</>}
          </button>
          
          <button 
            disabled={(step === 2 && !isStep2Valid) || loading || (step === 3 && type === 'SUBSCRIBER' && (formData.credits + (plans.find(p => p.id === formData.planId)?.tokenCost || 0)) > creatorBalance && creatorRole !== 'ADMIN')}
            onClick={step === 3 ? handleCreate : handleNext} 
            className="px-6 py-3 rounded-xl font-black text-sm hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100" 
            style={{ background: 'var(--color-primary)', color: '#0a0f0a', flex: 2 }}>
            {step === 3 ? (
              <>{loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />} Crear Usuario</>
            ) : (
              <>Siguiente <ChevronRight size={18} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
