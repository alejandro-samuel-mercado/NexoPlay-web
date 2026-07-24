'use client';
import { useState, useEffect } from 'react';
import { X, Key, MessageCircle, CheckCircle, AlertCircle, Loader2, LogIn, Lock } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { API, API_BASE, apiFetch } from '@/lib/api';
import { userFetch } from '@/lib/api-client';

interface UnlockCodeModalProps {
  isOpen: boolean;
  contentId?: string;
  contentTitle: string;
  onClose: () => void;
  onUnlocked: () => void;
  whatsappNumber?: string;
  whatsappMessage?: string;
}

export default function UnlockCodeModal({
  isOpen,
  contentId,
  contentTitle,
  onClose,
  onUnlocked,
  whatsappNumber = '5491112345678',
  whatsappMessage,
}: UnlockCodeModalProps) {
  const { user, isLoggedIn, refreshUser } = useAuth();
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [sitePhone, setSitePhone] = useState(whatsappNumber);

  // Fetch whatsapp number from public config on mount
  useEffect(() => {
    apiFetch(`${API_BASE}/api/config/public`)
      .then(res => {
        if (res.success && res.data?.whatsapp_number) {
          setSitePhone(res.data.whatsapp_number);
        }
      })
      .catch(() => {});
  }, []);

  const defaultMsg = whatsappMessage ||
    `Hola! Quiero un código para desbloquear "${contentTitle}" en la plataforma. Mi email es: ${user?.email || '(sin sesión)'}`;
  const waUrl = `https://wa.me/${sitePhone}?text=${encodeURIComponent(defaultMsg)}`;

  const handleRedeem = async () => {
    if (!code.trim()) { setErrorMsg('Ingresá un código'); return; }
    setStatus('loading');
    setErrorMsg('');
    try {
      const token = localStorage.getItem('nexo_access_token');
      const res = await userFetch(API.DOWNLOADS.REDEEM, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ 
          code: code.trim().toUpperCase(),
          targetContentId: contentId 
        }),
      });
      const json = await res.json();
      if (json.success) {
        setStatus('success');
        await refreshUser(); // Fetch updated user access state
        setTimeout(() => { onUnlocked(); onClose(); }, 1800);
      } else {
        setStatus('error');
        setErrorMsg(json.error || 'Código inválido o ya utilizado');
      }
    } catch {
      setStatus('error');
      setErrorMsg('Error de conexión. Intentá de nuevo.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-[28px] w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--color-primary)' }}>
              <Key size={20} className="text-black" />
            </div>
            <div>
              <h2 className="text-white font-black text-lg">Ingresar Código</h2>
              <p className="text-white/40 text-xs">Desbloquear acceso especial</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <X size={16} className="text-white/60" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-5">
          {/* Not logged in state */}
          {!isLoggedIn ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                <Lock size={28} className="text-white/40" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Iniciá sesión primero</h3>
              <p className="text-white/50 text-sm mb-6">
                Para usar un código de desbloqueo necesitás una cuenta. Así tu acceso queda guardado y podés ver el contenido cuando quieras.
              </p>
              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-3 rounded-2xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-colors">
                  Cancelar
                </button>
                <Link href={`/auth/login?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : '/')}`} className="flex-1 py-3 rounded-2xl font-bold text-sm text-black flex items-center justify-center gap-2 transition-transform hover:scale-105" style={{ background: 'var(--color-primary)' }}>
                  <LogIn size={16} /> Iniciar Sesión
                </Link>
              </div>
            </div>
          ) : status === 'success' ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <h3 className="text-white font-black text-xl mb-2">¡Desbloqueado!</h3>
              <p className="text-green-400 text-sm">Ya tenés acceso completo a <strong>{contentTitle}</strong>. Redirigiendo...</p>
            </div>
          ) : (
            <>
              <div>
                <p className="text-white/60 text-sm mb-4">
                  Ingresá el código que recibiste para desbloquear <strong className="text-white">&ldquo;{contentTitle}&rdquo;</strong> y poder verla o descargarla.
                </p>

                <label className="text-xs font-bold text-white/50 uppercase tracking-wider mb-2 block">Código de acceso</label>
                <input
                  value={code}
                  onChange={(e) => { setCode(e.target.value.toUpperCase()); setStatus('idle'); setErrorMsg(''); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleRedeem(); }}
                  placeholder="NEXO-XXXXX"
                  maxLength={12}
                  className="w-full bg-white/5 border border-white/15 rounded-2xl px-5 py-4 text-white font-mono text-xl font-bold tracking-widest text-center focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder-white/20"
                  disabled={status === 'loading'}
                />
                {errorMsg && (
                  <div className="flex items-center gap-2 mt-3 text-red-400 text-sm">
                    <AlertCircle size={14} />
                    <span>{errorMsg}</span>
                  </div>
                )}
              </div>

              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex items-start gap-3">
                <MessageCircle size={20} className="text-green-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-white/70 text-sm">¿No tenés un código?</p>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 font-bold text-sm hover:underline inline-flex items-center gap-1 mt-0.5"
                  >
                    Solicitalo por WhatsApp →
                  </a>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button onClick={onClose} className="flex-1 py-3 rounded-2xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-colors">
                  Cancelar
                </button>
                <button
                  onClick={handleRedeem}
                  disabled={status === 'loading' || !code.trim()}
                  className="flex-1 py-3 rounded-2xl font-bold text-sm text-black flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                  style={{ background: 'var(--color-primary)' }}
                >
                  {status === 'loading' ? (
                    <><Loader2 size={16} className="animate-spin" /> Verificando...</>
                  ) : (
                    <><Key size={16} /> Desbloquear</>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
