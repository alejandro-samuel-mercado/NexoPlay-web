'use client';

import { useState, useEffect } from 'react';
import { API, apiFetch } from '@/lib/api';

import { Settings, Save, Zap } from 'lucide-react';


type TokenRule = {
  id: string;
  action: string;
  tokensAwarded: number;
  dailyLimit: number | null;
  isActive: boolean;
};

const ACTION_LABELS: Record<string, string> = {
  POST_CREATED: 'Crear un post',
  COMMENT_ADDED: 'Comentar un post',
  REACTION_RECEIVED: 'Recibir un like en un post/comentario',
  TOP10_CREATED: 'Crear una lista Top 10',
  SUGGESTION_APPROVED: 'Sugerencia de película/serie aprobada',
  AD_WATCHED: 'Ver un anuncio voluntario',
};

export default function TokenRulesPage() {
  const [rules, setRules] = useState<TokenRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  
  // Local state to track inputs before saving
  const [edits, setEdits] = useState<Record<string, { tokensAwarded: number, dailyLimit: number | null }>>({});

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const res = await apiFetch(API.SOCIAL_ADMIN.RULES);
      setRules(res.data);
      
      const newEdits: Record<string, any> = {};
      res.data.forEach((r: TokenRule) => {
        newEdits[r.id] = { tokensAwarded: r.tokensAwarded, dailyLimit: r.dailyLimit };
      });
      setEdits(newEdits);
    } catch (error) {
      alert('Error al cargar reglas de tokens');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (id: string) => {
    const edit = edits[id];
    if (!edit) return;

    setSavingId(id);
    try {
      await apiFetch(API.SOCIAL_ADMIN.RULE(id), {
        method: 'PUT',
        body: JSON.stringify({
          tokensAwarded: Number(edit.tokensAwarded),
          dailyLimit: edit.dailyLimit ? Number(edit.dailyLimit) : null,
        }),
      });
      alert('Regla actualizada correctamente');
      
      // Update local rules array
      setRules(rules.map(r => r.id === id ? { ...r, ...edit } : r));
    } catch (error) {
      alert('Error al guardar la regla');
    } finally {
      setSavingId(null);
    }
  };

  const updateEdit = (id: string, field: 'tokensAwarded' | 'dailyLimit', value: string) => {
    setEdits(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value === '' ? null : Number(value)
      }
    }));
  };

  const hasChanges = (id: string) => {
    const rule = rules.find(r => r.id === id);
    const edit = edits[id];
    if (!rule || !edit) return false;
    return rule.tokensAwarded !== edit.tokensAwarded || rule.dailyLimit !== edit.dailyLimit;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="text-[#E82C7C]" size={20} />
            Reglas de Recompensas
          </h2>
          <p className="text-sm text-[#8B8FA8] mt-1">Configurá cuántos tokens ganan los usuarios por cada acción en la comunidad y el límite máximo por día.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 rounded-full border-4 border-[#E82C7C] border-t-transparent animate-spin" /></div>
      ) : (
        <div className="bg-[#1E1E3A] border border-[var(--border-subtle)] rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] bg-black/20">
                <th className="p-4 text-xs font-bold text-[#8B8FA8] uppercase">Acción</th>
                <th className="p-4 text-xs font-bold text-[#8B8FA8] uppercase w-32">Tokens a Otorgar</th>
                <th className="p-4 text-xs font-bold text-[#8B8FA8] uppercase w-40">Límite Diario (Veces)</th>
                <th className="p-4 text-xs font-bold text-[#8B8FA8] uppercase w-24 text-right">Guardar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {rules.map(rule => (
                <tr key={rule.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Zap size={16} className="text-[#E82C7C]" />
                      <span className="font-bold text-white">{ACTION_LABELS[rule.action] || rule.action}</span>
                    </div>
                    <p className="text-xs text-[#8B8FA8] mt-1 ml-6 font-mono">{rule.action}</p>
                  </td>
                  <td className="p-4">
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={edits[rule.id]?.tokensAwarded ?? ''}
                        onChange={(e) => updateEdit(rule.id, 'tokensAwarded', e.target.value)}
                        className="w-20 bg-black/40 border border-[var(--border-subtle)] rounded text-white px-2 py-1 focus:outline-none focus:border-[#E82C7C]"
                      />
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        placeholder="Sin límite"
                        value={edits[rule.id]?.dailyLimit ?? ''}
                        onChange={(e) => updateEdit(rule.id, 'dailyLimit', e.target.value)}
                        className="w-24 bg-black/40 border border-[var(--border-subtle)] rounded text-white px-2 py-1 focus:outline-none focus:border-[#E82C7C]"
                      />
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleSave(rule.id)}
                      disabled={!hasChanges(rule.id) || savingId === rule.id}
                      className={`p-2 rounded-lg transition-all ${
                        hasChanges(rule.id)
                          ? 'bg-[#E82C7C] text-white hover:bg-[#D02068]'
                          : 'bg-white/5 text-[#8B8FA8] cursor-not-allowed opacity-50'
                      }`}
                    >
                      {savingId === rule.id ? (
                        <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      ) : (
                        <Save size={18} />
                      )}
                    </button>
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
