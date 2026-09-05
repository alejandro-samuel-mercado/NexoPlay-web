'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, LogIn, ChevronDown, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Suspense } from 'react';

const TEST_USERS = [
  {
    username: 'admin',
    password: 'nexo_admin_2025',
    role: 'ADMIN',
    name: 'Admin Global',
    color: '#FF5C5C',
    bg: 'rgba(255,92,92,0.12)',
    emoji: '🔴',
  },
  {
    username: 'franquicia_demo',
    password: 'nexo_test_2025',
    role: 'FRANQUICIADO',
    name: 'Carlos Franquicia',
    color: '#60A5FA',
    bg: 'rgba(96,165,250,0.12)',
    emoji: '🔵',
  },
  {
    username: 'revendedor_demo',
    password: 'nexo_test_2025',
    role: 'REVENDEDOR',
    name: 'María Revendedora',
    color: '#34D399',
    bg: 'rgba(52,211,153,0.12)',
    emoji: '🟢',
  },
  {
    username: 'suscriptor_demo',
    password: 'nexo_test_2025',
    role: 'SUSCRIPTOR',
    name: 'Juan Suscriptor',
    color: '#FBBF24',
    bg: 'rgba(251,191,36,0.12)',
    emoji: '🟡',
  },
  {
    username: 'invitado_demo',
    password: 'nexo_test_2025',
    role: 'GUEST',
    name: 'Ana Invitada',
    color: '#8B8FA8',
    bg: 'rgba(139,143,168,0.12)',
    emoji: '⚪',
  },
];

function LoginContent() {
  const { login, isLoggedIn, isLoading, user } = useAuth();
  const router = useRouter();

  const searchParams = useSearchParams();

  // Redirigir al panel correspondiente según el rol, o a la ruta solicitada
  useEffect(() => {
    if (!isLoading && isLoggedIn && user) {
      const explicitRedirect = searchParams?.get('redirect');
      let targetPath = '/';
      
      if (explicitRedirect) {
        targetPath = explicitRedirect;
      } else if (['ADMIN', 'FRANCHISEE'].includes(user.role)) {
        targetPath = '/admin';
      } else if (['RESELLER', 'SUPER_RESELLER', 'ADMIN_RESELLER'].includes(user.role)) {
        targetPath = '/reseller';
      }
      
      router.replace(targetPath);
    }
  }, [isLoggedIn, isLoading, user, router, searchParams]);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showTestUsers, setShowTestUsers] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(identifier, password);
      // El useEffect se encargará de la redirección al detectar el cambio en `isLoggedIn` y `user`
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally { setLoading(false); }
  };

  const quickLogin = async (testIdentifier: string, testPassword: string) => {
    setIdentifier(testIdentifier);
    setPassword(testPassword);
    setLoading(true); setError('');
    try {
      await login(testIdentifier, testPassword);
      // El useEffect se encargará de la redirección al detectar el cambio en `isLoggedIn` y `user`
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen w-full flex-1 flex items-center justify-center p-4 relative overflow-hidden bg-[var(--bg-main)]">
      {/* Background shapes */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center">
        <div className="absolute top-[-15%] left-[-10%] w-[60vw] h-[60vw] rounded-full opacity-[0.15] blur-[120px] bg-slate-400" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full opacity-[0.12] blur-[130px] bg-slate-300" />
        <div className="absolute top-[30%] left-[50%] w-[40vw] h-[40vw] rounded-full opacity-[0.08] blur-[100px] bg-white" />
      </div>

      <div className="relative z-10 w-full max-w-[440px]">
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
            Vexa
            </span>
          </Link>
        </div>

        {/* Main card */}
        <div
          className="p-8 sm:p-10 rounded-[32px] border border-white/20 relative overflow-hidden shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3), inset 0 -1px 1px rgba(255,255,255,0.05), 0 25px 50px -12px rgba(0,0,0,0.5)',
          }}
        >
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

          <div className="relative z-10">
            <h1 className="text-2xl font-black text-[var(--text-main)] mb-2 tracking-tight">Bienvenido de vuelta 👋</h1>
            <p className="text-sm text-[var(--text-muted)] mb-8">Inicia sesión para continuar disfrutando</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Usuario o Email</label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="tu_usuario o tu@email.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-[var(--text-main)] outline-none focus:border-white/30 focus:bg-white/10 transition-all placeholder:text-[var(--text-muted)]/50 shadow-inner"
                  required
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Contraseña</label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 pr-12 text-[var(--text-main)] outline-none focus:border-white/30 focus:bg-white/10 transition-all placeholder:text-[var(--text-muted)]/50 shadow-inner"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                  >
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-white/90 backdrop-blur-md border border-white/30 text-black font-black text-[15px] rounded-xl hover:bg-white transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 mt-4 shadow-[0_4px_20px_0_rgba(255,255,255,0.25)]"
              >
                {loading ? 'Validando...' : <><LogIn size={18} /> Iniciar Sesión</>}
              </button>
            </form>
          </div>
        </div>


      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full bg-[var(--bg-main)]" />}>
      <LoginContent />
    </Suspense>
  );
}
