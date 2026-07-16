'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { API } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function RegistroPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(API.AUTH.REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al registrarse');
      }

      // Automatically login after successful registration
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex-1 flex items-center justify-center p-4 relative overflow-hidden bg-[var(--bg-main)]">
      {/* Cinematic Glassmorphism Background Shapes */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full opacity-20 blur-[100px]" style={{ background: 'var(--color-primary)' }} />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full opacity-10 blur-[120px]" style={{ background: 'var(--color-primary)' }} />
      </div>

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Logo */}
        <div className="text-center mb-10 flex flex-col items-center justify-center">
          <Link href="/" className="inline-flex items-center gap-3 decoration-transparent">
            <div className="flex flex-col gap-0.5 items-center">
              <div className="w-4 h-6 rounded-sm bg-[var(--color-primary)] flex flex-col items-center justify-evenly py-0.5 shadow-[0_0_15px_rgba(255,179,0,0.4)]">
                <div className="w-1.5 h-1.5 rounded-full bg-black/60"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-black/60"></div>
              </div>
              <div className="w-4 h-6 rounded-sm bg-[var(--color-primary)] flex flex-col items-center justify-evenly py-0.5 shadow-[0_0_15px_rgba(255,179,0,0.4)]">
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
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent opacity-50" />

          <h1 className="text-2xl font-black text-[var(--text-main)] mb-2 tracking-tight">Crear Cuenta ✨</h1>
          <p className="text-sm text-[var(--text-muted)] mb-8">Únete para guardar tus favoritos</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Nombre</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre" 
                className="w-full bg-[var(--input-bg)] border border-[var(--border-subtle)] rounded-xl px-5 py-3 text-[var(--text-main)] outline-none focus:border-[var(--color-primary)] focus:shadow-[0_0_10px_rgba(255,179,0,0.2)] transition-all placeholder:text-[var(--text-muted)]/50"
                required autoComplete="name" />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com" 
                className="w-full bg-[var(--input-bg)] border border-[var(--border-subtle)] rounded-xl px-5 py-3 text-[var(--text-main)] outline-none focus:border-[var(--color-primary)] focus:shadow-[0_0_10px_rgba(255,179,0,0.2)] transition-all placeholder:text-[var(--text-muted)]/50"
                required autoComplete="email" />
            </div>

            <div>
              <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Contraseña</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full bg-[var(--input-bg)] border border-[var(--border-subtle)] rounded-xl px-5 py-3 pr-12 text-[var(--text-main)] outline-none focus:border-[var(--color-primary)] focus:shadow-[0_0_10px_rgba(255,179,0,0.2)] transition-all placeholder:text-[var(--text-muted)]/50"
                  required autoComplete="new-password" minLength={8} />
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
              className="w-full py-3.5 bg-[var(--color-primary)] text-black font-black text-[15px] rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 mt-2 shadow-[0_0_20px_rgba(255,179,0,0.3)]">
              {loading ? 'Creando cuenta...' : <><UserPlus size={18} /> Registrarse</>}
            </button>
          </form>
          
          <div className="mt-8 text-center text-sm text-[var(--text-muted)]">
            ¿Ya tienes cuenta?{' '}
            <Link href="/auth/login" className="text-[var(--color-primary)] font-bold hover:underline">
              Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
