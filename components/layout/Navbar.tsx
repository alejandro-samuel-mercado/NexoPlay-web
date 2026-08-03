'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, Download, Search, User, LogOut, Crown, Home, Compass, BookOpen } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, activeProfile, isLoggedIn, isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
    setUserMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 border-b-[3px] border-[#3A3A5C]"
      style={{ background: 'rgba(26,26,46,0.95)', backdropFilter: 'blur(12px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-[10px] border-[3px] border-[#2C2C2C] flex items-center justify-center text-sm font-black text-white"
              style={{ background: 'var(--clay-red)', boxShadow: '3px 3px 0px #2C2C2C' }}>
              N
            </div>
            <span className="font-black text-xl tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              <span style={{ color: 'var(--clay-red)' }}>Nexo</span>
              <span className="text-white">Play</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/" className="flex items-center gap-1.5 text-sm font-bold text-[#A8B3C8] hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">
              <Home size={15} /> Inicio
            </Link>

            <Link href="/tienda" className="flex items-center gap-1.5 text-sm font-bold text-[#A8B3C8] hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">
              <Crown size={15} /> Tienda
            </Link>
            <Link href="/buscar" className="flex items-center gap-1.5 text-sm font-bold text-[#A8B3C8] hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">
              <Search size={15} /> Buscar
            </Link>
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <div className="relative">
                <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-[10px] border-[2px] border-[#3A3A5C] bg-[#252540] hover:border-[#4ECDC4] transition-all">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black overflow-hidden"
                    style={{ background: 'var(--clay-teal)', color: 'var(--clay-ink)' }}>
                    {activeProfile?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm font-bold text-white max-w-24 truncate">
                    {activeProfile?.name || 'Perfil'}
                  </span>
                  {user?.subscription && (
                    <Crown size={12} style={{ color: 'var(--clay-yellow)' }} />
                  )}
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 clay-card-dark rounded-[12px] border-[2px] border-[#3A3A5C] overflow-hidden z-50"
                    style={{ boxShadow: '4px 4px 0px #1A1A2E' }}>
                    <div className="px-4 py-3 border-b border-[#3A3A5C]">
                      <p className="text-xs text-[#6B7280] font-semibold">Conectado como</p>
                      <p className="text-sm font-bold text-white truncate">{user?.email}</p>
                      {user?.subscription ? (
                        <span className="clay-badge text-[10px] mt-1" style={{ color: 'var(--clay-yellow)', borderColor: 'var(--clay-yellow)' }}>
                          ⭐ {user.subscription.plan.name}
                        </span>
                      ) : (
                        <span className="clay-badge text-[10px] mt-1 text-[#6B7280] border-[#6B7280]">Invitado</span>
                      )}
                    </div>
                    <div className="py-1">
                      <Link href="/perfiles" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#A8B3C8] hover:text-white hover:bg-white/5 transition-all">
                        <User size={14} /> Cambiar Perfil
                      </Link>
                      <Link href="/perfil" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#A8B3C8] hover:text-white hover:bg-white/5 transition-all">
                        <User size={14} /> Cuenta Global
                      </Link>
                      <Link href="/biblioteca" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#A8B3C8] hover:text-white hover:bg-white/5 transition-all">
                        <BookOpen size={14} /> Mi Biblioteca
                      </Link>
                      {isAdmin && (
                        <Link href="/admin" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all"
                          style={{ color: 'var(--clay-teal)' }}>
                          <Crown size={14} /> Panel Admin
                        </Link>
                      )}
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#FF6B6B] hover:bg-white/5 transition-all">
                        <LogOut size={14} /> Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/auth/login" className="btn-clay btn-clay-ghost btn-clay-sm">
                  Iniciar sesión
                </Link>
                <Link href="/auth/registro" className="btn-clay btn-clay-teal btn-clay-sm">
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-white hover:bg-white/5 transition-all">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-[#3A3A5C] space-y-1">
            <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-[#A8B3C8] hover:text-white hover:bg-white/5">
              <Home size={16} /> Inicio
            </Link>

            <Link href="/tienda" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-[#A8B3C8] hover:text-white hover:bg-white/5">
              <Crown size={16} /> Tienda
            </Link>
            <Link href="/buscar" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-[#A8B3C8] hover:text-white hover:bg-white/5">
              <Search size={16} /> Buscar
            </Link>
            {isLoggedIn ? (
              <>
                <Link href="/perfil" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-[#A8B3C8] hover:text-white hover:bg-white/5">
                  <User size={16} /> Mi Perfil
                </Link>
                <Link href="/biblioteca" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-[#A8B3C8] hover:text-white hover:bg-white/5">
                  <BookOpen size={16} /> Mi Biblioteca
                </Link>
                {isAdmin && (
                  <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold" style={{ color: 'var(--clay-teal)' }}>
                    <Crown size={16} /> Panel Admin
                  </Link>
                )}
                <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold text-[#FF6B6B]">
                  <LogOut size={16} /> Cerrar sesión
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="btn-clay btn-clay-ghost text-center">Iniciar sesión</Link>
                <Link href="/auth/registro" onClick={() => setMenuOpen(false)} className="btn-clay btn-clay-teal text-center">Registrarse</Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Click outside to close user menu */}
      {userMenuOpen && <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />}
    </nav>
  );
}
