'use client';

import { API, apiFetch } from '@/lib/api';
import { useEffect, useState } from 'react';

import { Pencil, Plus, Save, Target, X } from 'lucide-react';


type Goal = {
  id: string;
  name: string;
  description: string | null;
  tokenCost: number;
  type: 'DOWNLOAD_CODE' | 'SUBSCRIPTION_CREDIT';
  cycle: 'ONE_TIME' | 'RECURRING';
  isActive: boolean;
};

export default function TokenGoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tokenCost: '100',
    type: 'DOWNLOAD_CODE',
    cycle: 'ONE_TIME',
    isActive: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const res = await apiFetch(API.SOCIAL_ADMIN.GOALS);
      setGoals(res.data);
    } catch (error) {
      alert('Error al cargar metas de canje');
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (goal?: Goal) => {
    if (goal) {
      setEditingGoal(goal);
      setFormData({
        name: goal.name,
        description: goal.description || '',
        tokenCost: goal.tokenCost.toString(),
        type: goal.type,
        cycle: goal.cycle,
        isActive: goal.isActive,
      });
    } else {
      setEditingGoal(null);
      setFormData({
        name: '',
        description: '',
        tokenCost: '100',
        type: 'DOWNLOAD_CODE',
        cycle: 'ONE_TIME',
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return alert('El nombre es requerido');
    
    setIsSaving(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description || null,
        tokenCost: Number(formData.tokenCost),
        type: formData.type,
        cycle: formData.cycle,
        isActive: formData.isActive,
      };

      if (editingGoal) {
        await apiFetch(API.SOCIAL_ADMIN.GOAL(editingGoal.id), {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        alert('Meta actualizada');
      } else {
        await apiFetch(API.SOCIAL_ADMIN.GOALS, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        alert('Meta creada');
      }
      
      setIsModalOpen(false);
      fetchGoals();
    } catch (error: any) {
      alert(error.message || 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await apiFetch(API.SOCIAL_ADMIN.GOAL(id), {
        method: 'PUT',
        body: JSON.stringify({ isActive: !current }),
      });
      alert(current ? 'Meta desactivada' : 'Meta activada');
      setGoals(goals.map(g => g.id === id ? { ...g, isActive: !current } : g));
    } catch (error) {
      alert('Error al actualizar');
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Target className="text-[#E82C7C]" size={20} />
            Metas de Canje
          </h2>
          <p className="text-sm text-[#8B8FA8] mt-1">Definí los premios que los usuarios pueden obtener canjeando sus créditos.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-[#E82C7C] hover:bg-[#D02068] text-white px-4 py-2 rounded-lg font-bold transition-all"
        >
          <Plus size={18} />
          Nueva Meta
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 rounded-full border-4 border-[#E82C7C] border-t-transparent animate-spin" /></div>
      ) : goals.length === 0 ? (
        <div className="text-center py-12 bg-[#1E1E3A] border border-[var(--border-subtle)] rounded-xl">
          <p className="text-[#8B8FA8]">No hay metas configuradas. Creá la primera.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map(goal => (
            <div key={goal.id} className={`bg-[#1E1E3A] border border-[var(--border-subtle)] rounded-xl p-5 flex flex-col ${!goal.isActive ? 'opacity-60' : ''}`}>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-white text-lg leading-tight">{goal.name}</h3>
                <div className="bg-[#E82C7C]/20 border border-[#E82C7C]/30 px-2 py-1 rounded text-[#E82C7C] font-bold text-xs">
                  {goal.tokenCost} tokens
                </div>
              </div>
              
              <p className="text-sm text-[#8B8FA8] mb-4 flex-1">{goal.description || 'Sin descripción'}</p>
              
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 px-2 py-1 rounded text-[#8B8FA8]">
                  {goal.type === 'DOWNLOAD_CODE' ? 'Descarga' : 'Crédito de Suscripción'}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 px-2 py-1 rounded text-[#8B8FA8]">
                  {goal.cycle === 'ONE_TIME' ? 'Única vez' : 'Recurrente'}
                </span>
              </div>
              
              <div className="border-t border-[var(--border-subtle)] pt-3 flex items-center justify-between">
                <button
                  onClick={() => toggleActive(goal.id, goal.isActive)}
                  className={`text-xs font-bold ${goal.isActive ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}`}
                >
                  {goal.isActive ? 'Desactivar' : 'Activar'}
                </button>
                <button
                  onClick={() => openModal(goal)}
                  className="flex items-center gap-1.5 text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded transition-all text-xs font-bold"
                >
                  <Pencil size={14} /> Editar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#1E1E3A] border border-[var(--border-subtle)] rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
              <h3 className="font-bold text-lg text-white">{editingGoal ? 'Editar Meta' : 'Nueva Meta'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#8B8FA8] hover:text-white"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#8B8FA8] uppercase tracking-wider mb-1">Nombre del premio</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-black/40 border border-[var(--border-subtle)] rounded-lg text-white px-3 py-2 focus:border-[#E82C7C] focus:outline-none"
                  placeholder="Ej: 1 Mes de Vexa Gratis"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-[#8B8FA8] uppercase tracking-wider mb-1">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-black/40 border border-[var(--border-subtle)] rounded-lg text-white px-3 py-2 focus:border-[#E82C7C] focus:outline-none min-h-[80px] resize-none"
                  placeholder="Detalles sobre cómo usar el premio..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#8B8FA8] uppercase tracking-wider mb-1">Costo en Créditos</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={formData.tokenCost}
                    onChange={e => setFormData({...formData, tokenCost: e.target.value})}
                    className="w-full bg-black/40 border border-[var(--border-subtle)] rounded-lg text-white px-3 py-2 focus:border-[#E82C7C] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#8B8FA8] uppercase tracking-wider mb-1">Activo</label>
                  <select
                    value={formData.isActive.toString()}
                    onChange={e => setFormData({...formData, isActive: e.target.value === 'true'})}
                    className="w-full bg-black/40 border border-[var(--border-subtle)] rounded-lg text-white px-3 py-2 focus:border-[#E82C7C] focus:outline-none appearance-none"
                  >
                    <option value="true">Sí (Visible)</option>
                    <option value="false">No (Oculto)</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#8B8FA8] uppercase tracking-wider mb-1">Tipo de Premio</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as any})}
                    className="w-full bg-black/40 border border-[var(--border-subtle)] rounded-lg text-white px-3 py-2 focus:border-[#E82C7C] focus:outline-none appearance-none"
                  >
                    <option value="DOWNLOAD_CODE">Código de Descarga</option>
                    <option value="SUBSCRIPTION_CREDIT">Crédito Suscripción</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#8B8FA8] uppercase tracking-wider mb-1">Ciclo</label>
                  <select
                    value={formData.cycle}
                    onChange={e => setFormData({...formData, cycle: e.target.value as any})}
                    className="w-full bg-black/40 border border-[var(--border-subtle)] rounded-lg text-white px-3 py-2 focus:border-[#E82C7C] focus:outline-none appearance-none"
                  >
                    <option value="ONE_TIME">Una sola vez por usuario</option>
                    <option value="RECURRING">Recurrente (Múltiples veces)</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-4 mt-2 border-t border-[var(--border-subtle)] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg font-bold text-[#8B8FA8] hover:text-white transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-[#E82C7C] hover:bg-[#D02068] text-white px-4 py-2 rounded-lg font-bold transition-all disabled:opacity-50"
                >
                  {isSaving ? <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Save size={18} />}
                  Guardar Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
