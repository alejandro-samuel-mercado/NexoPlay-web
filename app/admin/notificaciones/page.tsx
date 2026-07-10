'use client';

import { useState } from 'react';
import { Send, BellRing, Users } from 'lucide-react';
import { API_BASE, apiFetch } from '@/lib/api';

export default function AdminNotificacionesPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) return alert('Llena ambos campos');
    setSending(true);
    setResult(null);
    try {
      const res = await apiFetch(`${API_BASE}/api/admin/notifications/send`, {
        method: 'POST',
        body: JSON.stringify({ title, body }),
      });
      if (res.success) {
        setResult(res.data);
        setTitle('');
        setBody('');
      } else {
        alert(res.error || 'Error al enviar');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-[var(--clay-teal)] flex items-center justify-center border-2 border-[var(--clay-ink)]" style={{ boxShadow: '3px 3px 0px var(--clay-ink)' }}>
          <BellRing size={24} className="text-[var(--clay-ink)]" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Space Grotesk' }}>Notificaciones Push</h1>
          <p className="text-[#A8B3C8] text-sm mt-1">Envía avisos al instante a los celulares de tus usuarios</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Formulario */}
        <div className="bg-[#12122A] p-6 rounded-[24px] border border-[#3A3A5C]">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Send size={18} className="text-[var(--clay-teal)]" />
            Redactar Mensaje
          </h2>
          
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#A8B3C8] uppercase mb-2">Título de la Notificación</label>
              <input
                type="text"
                placeholder="Ej: ¡Nuevo Estreno Disponible! 🍿"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#1A1A3A] border border-[#3A3A5C] rounded-xl p-4 text-white font-semibold focus:outline-none focus:border-[var(--clay-teal)]"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-[#A8B3C8] uppercase mb-2">Cuerpo del Mensaje</label>
              <textarea
                placeholder="Ej: Ya puedes ver la segunda temporada completa en la app."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                className="w-full bg-[#1A1A3A] border border-[#3A3A5C] rounded-xl p-4 text-white focus:outline-none focus:border-[var(--clay-teal)] resize-none"
              />
            </div>

            <button 
              onClick={handleSend}
              disabled={sending}
              className={`w-full py-4 rounded-xl font-black text-[var(--clay-ink)] flex items-center justify-center gap-2 transition-all
                ${sending ? 'bg-gray-500 cursor-not-allowed' : 'bg-[var(--clay-teal)] hover:-translate-y-1'}`}
              style={sending ? {} : { boxShadow: '3px 3px 0px var(--clay-ink)', border: '2px solid var(--clay-ink)' }}
            >
              {sending ? 'Enviando al mundo...' : 'Disparar Notificación'}
              {!sending && <Send size={18} />}
            </button>
          </div>
        </div>

        {/* Info & Results */}
        <div className="space-y-6">
          <div className="bg-[#1A1A3A] p-6 rounded-2xl border border-[var(--clay-teal)]/30 border-l-4 border-l-[var(--clay-teal)]">
            <h3 className="text-white font-bold mb-2 flex items-center gap-2">
              <Users size={18} className="text-[var(--clay-teal)]" />
              Alcance Global
            </h3>
            <p className="text-sm text-[#A8B3C8] leading-relaxed">
              Al disparar este mensaje, todos los usuarios que hayan iniciado sesión en la app móvil y aceptado los permisos, recibirán una vibración/sonido en su celular instantáneamente.
            </p>
          </div>

          {result && (
            <div className="bg-[#12122A] p-6 rounded-2xl border border-green-500/30">
              <h3 className="text-green-400 font-bold mb-4">✅ Resumen del Envío</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#1A1A3A] p-4 rounded-xl text-center">
                  <p className="text-3xl font-black text-white">{result.sent}</p>
                  <p className="text-xs text-[#A8B3C8] uppercase font-bold mt-1">Dispositivos Alcanzados</p>
                </div>
              </div>
            </div>
          )}

          {/* Preview Simulador */}
          <div className="mt-8 relative w-64 h-24 mx-auto">
            <div className="absolute inset-0 bg-white/10 rounded-2xl blur-xl"></div>
            <div className="relative bg-[#1E1E1E] rounded-2xl p-4 border border-[#333] shadow-2xl flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--clay-red)] flex items-center justify-center text-[10px] font-black text-white border border-white/20">
                N
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-white/90">NexoPlay</span>
                  <span className="text-[9px] text-white/50">ahora</span>
                </div>
                <p className="text-[11px] font-bold text-white truncate">{title || 'Título del mensaje'}</p>
                <p className="text-[10px] text-white/70 truncate">{body || 'El contenido de tu notificación aparecerá aquí...'}</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
