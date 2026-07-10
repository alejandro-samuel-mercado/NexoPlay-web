'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn } from 'lucide-react';
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
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Background */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #1A1A2E 0%, #0F0F1A 60%, #1A1A2E 100%)' }}>
        <div className="absolute top-20 left-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl" style={{ background: 'var(--clay-teal)' }} />
        <div className="absolute bottom-20 right-1/4 w-48 h-48 rounded-full opacity-10 blur-3xl" style={{ background: 'var(--clay-red)' }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-[14px] border-[3px] border-[#2C2C2C] flex items-center justify-center text-xl font-black text-white"
              style={{ background: 'var(--clay-red)', boxShadow: '4px 4px 0px #2C2C2C' }}>N</div>
            <span className="font-black text-2xl" style={{ fontFamily: 'Space Grotesk' }}>
              <span style={{ color: 'var(--clay-red)' }}>Nexo</span><span className="text-white">Play</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="clay-card-dark p-8 rounded-[24px] border-[3px]"
          style={{ borderColor: '#3A3A5C', boxShadow: '8px 8px 0px #1A1A2E' }}>
          <h1 className="text-2xl font-black text-white mb-1">Bienvenido de vuelta 👋</h1>
          <p className="text-sm text-[#6B7280] mb-8">Ingresá a tu cuenta de NexoPlay</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#A8B3C8] mb-1.5 block">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com" className="clay-input"
                required autoComplete="email" />
            </div>

            <div>
              <label className="text-xs font-bold text-[#A8B3C8] mb-1.5 block">Contraseña</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" className="clay-input pr-12"
                  required autoComplete="current-password" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-white transition-colors">
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 rounded-[10px] border-[2px] text-sm font-semibold"
                style={{ background: 'rgba(255,107,107,0.1)', borderColor: 'var(--clay-red)', color: 'var(--clay-red)' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-clay btn-clay-red w-full flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? 'Ingresando...' : <><LogIn size={18} /> Iniciar sesión</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
