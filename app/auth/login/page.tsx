'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen w-full flex-1 flex items-center justify-center p-4 relative overflow-hidden bg-[var(--bg-main)]">
      {/* Subtle Cinematic Background Shapes (Slate/Blueish like home) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full opacity-20 blur-[100px]" style={{ background: '#3b82f6' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full opacity-10 blur-[120px]" style={{ background: '#475569' }} />
      </div>

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Logo */}
        <div className="text-center mb-10 flex flex-col items-center justify-center">
          <Link href="/" className="inline-flex items-center gap-3 decoration-transparent">
            <div className="flex flex-col gap-0.5 items-center">
              <div className="w-4 h-6 rounded-sm bg-[var(--color-primary)] flex flex-col items-center justify-evenly py-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-black/60"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-black/60"></div>
              </div>
              <div className="w-4 h-6 rounded-sm bg-[var(--color-primary)] flex flex-col items-center justify-evenly py-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-black/60"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-black/60"></div>
              </div>
            </div>
            <span className="font-black text-3xl tracking-tight text-[var(--text-main)] lowercase">
              serivia
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="p-8 sm:p-10 rounded-[32px] border border-[var(--border-subtle)] shadow-2xl relative overflow-hidden"
          style={{ background: 'var(--bg-panel)', backdropFilter: 'blur(24px)' }}>
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" />

          <h1 className="text-2xl font-black text-[var(--text-main)] mb-2 tracking-tight">Bienvenido de vuelta 👋</h1>
          <p className="text-sm text-[var(--text-muted)] mb-8">Inicia sesión para continuar disfrutando</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com" 
                className="w-full bg-[var(--input-bg)] border border-[var(--border-subtle)] rounded-xl px-5 py-3 text-[var(--text-main)] outline-none focus:border-white/20 transition-all placeholder:text-[var(--text-muted)]/50"
                required autoComplete="email" />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Contraseña</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-[var(--input-bg)] border border-[var(--border-subtle)] rounded-xl px-5 py-3 pr-12 text-[var(--text-main)] outline-none focus:border-white/20 transition-all placeholder:text-[var(--text-muted)]/50"
                  required autoComplete="current-password" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-bold flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 bg-white text-black font-black text-[15px] rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 mt-2">
              {loading ? 'Validando credenciales...' : <><LogIn size={18} /> Iniciar Sesión</>}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-[var(--text-muted)]">
            ¿No tienes cuenta? <Link href="/auth/registro" className="text-[var(--color-primary)] font-bold hover:underline">Regístrate</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
