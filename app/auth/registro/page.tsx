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
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8"
      style={{
        background: 'radial-gradient(circle at top right, rgba(139,92,246,0.15), transparent 40%), var(--bg-main)'
      }}>

      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center w-14 h-14 rounded-[16px] mb-6 border-[2px]"
            style={{ background: 'var(--clay-primary)', borderColor: 'var(--clay-primary)', boxShadow: '0 8px 16px rgba(139,92,246,0.3)' }}>
            <span className="text-white font-black text-2xl drop-shadow-md">N</span>
          </Link>
        </div>

        {/* Card */}
        <div className="clay-card-dark p-8 rounded-[24px] border-[3px]"
          style={{ borderColor: '#3A3A5C', boxShadow: '8px 8px 0px #1A1A2E' }}>
          <h1 className="text-2xl font-black text-white mb-1">Crear Cuenta ✨</h1>
          <p className="text-sm text-[#6B7280] mb-8">Únete a NexoPlay y guarda tus favoritos</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#A8B3C8] mb-1.5 block">Nombre</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre" className="clay-input"
                required autoComplete="name" />
            </div>

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
                  required autoComplete="new-password" minLength={8} />
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
              className="btn-clay btn-clay-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? 'Creando cuenta...' : <><UserPlus size={18} /> Registrarse</>}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-[#A8B3C8] text-sm">
              ¿Ya tienes cuenta?{' '}
              <Link href="/auth/login" className="text-white font-bold hover:underline">
                Iniciar sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
