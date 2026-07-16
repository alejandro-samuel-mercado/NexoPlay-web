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
      {/* Heavy Cinematic Glassmorphism Background Shapes (Grays/Slate) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center">
        <div className="absolute top-[-15%] left-[-10%] w-[60vw] h-[60vw] rounded-full opacity-[0.15] blur-[120px] bg-slate-400" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full opacity-[0.12] blur-[130px] bg-slate-300" />
        <div className="absolute top-[30%] left-[50%] w-[40vw] h-[40vw] rounded-full opacity-[0.08] blur-[100px] bg-white" />
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
        <div className="p-8 sm:p-10 rounded-[32px] border border-white/20 relative overflow-hidden shadow-2xl"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)', boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3), inset 0 -1px 1px rgba(255,255,255,0.05), 0 25px 50px -12px rgba(0,0,0,0.5)' }}>
          
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

          <div className="relative z-10">
            <h1 className="text-2xl font-black text-[var(--text-main)] mb-2 tracking-tight">Bienvenido de vuelta 👋</h1>
          <p className="text-sm text-[var(--text-muted)] mb-8">Inicia sesión para continuar disfrutando</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-[var(--text-main)] outline-none focus:border-white/30 focus:bg-white/10 transition-all placeholder:text-[var(--text-muted)]/50 shadow-inner"
                required autoComplete="email" />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Contraseña</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 pr-12 text-[var(--text-main)] outline-none focus:border-white/30 focus:bg-white/10 transition-all placeholder:text-[var(--text-muted)]/50 shadow-inner"
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
              className="w-full py-3.5 bg-white/90 backdrop-blur-md border border-white/30 text-black font-black text-[15px] rounded-xl hover:bg-white transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 mt-4 shadow-[0_4px_20px_0_rgba(255,255,255,0.25)]">
              {loading ? 'Validando...' : <><LogIn size={18} /> Iniciar Sesión</>}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-[var(--text-muted)] relative z-10">
            ¿No tienes cuenta? <Link href="/auth/registro" className="text-[var(--color-primary)] font-bold hover:underline">Regístrate</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
