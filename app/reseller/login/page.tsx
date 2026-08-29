'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Download, Eye, EyeOff, LogIn, ShieldCheck } from 'lucide-react';
import { apiFetch, API } from '@/lib/api';

function ResellerLoginContent() {
  const searchParams = useSearchParams();
  const redirect = searchParams?.get('redirect') || '/reseller';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await apiFetch(API.AUTH.LOGIN, {
        method: 'POST',
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });
      const user = res?.data?.user;
      if (!user) throw new Error('Respuesta inesperada del servidor.');
      if (user.role !== 'RESELLER') {
        throw new Error('Esta cuenta no tiene acceso al Panel Revendedor. Solo cuentas con rol REVENDEDOR pueden ingresar.');
      }
      localStorage.setItem('nexo_access_token', res.data.accessToken);
      localStorage.setItem('nexo_refresh_token', res.data.refreshToken);
      window.location.href = redirect;
    } catch (err: any) {
      setError(err.message || 'Credenciales inválidas o sin acceso.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4" style={{ background: 'var(--bg-main)' }}>
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="w-full max-w-md relative z-10">
        <div className="rounded-2xl border overflow-hidden shadow-2xl" style={{ background: 'var(--bg-panel)', borderColor: 'var(--border-subtle)' }}>
          {/* Header */}
          <div className="px-8 py-6 border-b flex items-center gap-4" style={{ borderColor: 'var(--border-subtle)', background: 'rgba(52,211,153,0.06)' }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#34D399', boxShadow: '0 4px 20px rgba(52,211,153,0.4)' }}>
              <Download size={20} color="#0a0f0a" strokeWidth={3} />
            </div>
            <div>
              <h1 className="font-black text-white text-lg leading-tight">Panel Revendedor B2B</h1>
              <p className="text-xs mt-0.5" style={{ color: '#34D399' }}>NexoPlay · Acceso exclusivo</p>
            </div>
          </div>

          <div className="px-8 py-8">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg mb-6 text-xs font-bold"
              style={{ background: 'rgba(52,211,153,0.08)', color: '#34D399', border: '1px solid rgba(52,211,153,0.2)' }}>
              <ShieldCheck size={13} /> Acceso restringido — Solo cuentas REVENDEDOR
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: '#6B7280' }}>Usuario o Email</label>
                <input type="text" value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="tu_usuario o tu@email.com"
                  required autoComplete="username"
                  className="w-full px-5 py-3 rounded-xl text-white outline-none transition-all placeholder:text-gray-600"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.08)' }} />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider mb-2 block" style={{ color: '#6B7280' }}>Contraseña</label>
                <div className="relative">
                  <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                    required autoComplete="current-password"
                    className="w-full px-5 py-3 pr-12 rounded-xl text-white outline-none transition-all placeholder:text-gray-600"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.08)' }} />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: '#6B7280' }}>
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2"
                  style={{ background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)', color: '#FF6B6B' }}>
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[#FF6B6B]" /> {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all mt-1 disabled:opacity-50 disabled:pointer-events-none"
                style={{ background: '#34D399', color: '#0a0f0a', boxShadow: '0 4px 20px rgba(52,211,153,0.35)' }}>
                {loading ? <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#0a0f0a', borderTopColor: 'transparent' }} />
                  : <><LogIn size={16} strokeWidth={3} /> Ingresar al Panel</>}
              </button>
            </form>
          </div>
        </div>
        <p className="text-center text-xs mt-4" style={{ color: '#4B5563' }}>¿No eres revendedor? Contacta al administrador del sistema.</p>
      </div>
    </div>
  );
}

export default function ResellerLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full" style={{ background: 'var(--bg-main)' }} />}>
      <ResellerLoginContent />
    </Suspense>
  );
}
