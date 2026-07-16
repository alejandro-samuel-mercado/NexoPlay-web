'use client';

import { useAuth } from '@/context/AuthContext';
import PublicLayout from '@/components/layout/PublicLayout';
import { useState } from 'react';
import { Bell, Lock, Moon, Settings, Sun, User, Video, Shield, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { API_ROUTES } from '@/lib/api-routes';

export default function ConfiguracionPage() {
    const { user, isAdmin, isReseller } = useAuth();
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');
    const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', currentPassword: '', newPassword: '' });

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMsg('');
        try {
            const token = localStorage.getItem('accessToken');
            const r = await fetch(`${API_ROUTES.AUTH.ME}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ name: form.name, ...(form.newPassword && { currentPassword: form.currentPassword, newPassword: form.newPassword }) })
            });
            const j = await r.json();
            if (j.success) setMsg('✓ Datos actualizados correctamente');
            else setMsg(j.error || 'Error al guardar');
        } catch {
            setMsg('Error de conexión');
        } finally {
            setSaving(false);
        }
    };

    if (!user) {
        return (
            <PublicLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-[var(--text-muted)]">
                    <Lock size={48} className="opacity-40" />
                    <h2 className="text-xl font-bold text-[var(--text-main)]">Inicia sesión para ver la configuración</h2>
                    <Link href="/auth/login" className="px-6 py-2.5 bg-[var(--color-primary)] text-black rounded-full font-bold hover:scale-105 transition">Iniciar Sesión</Link>
                </div>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout>
            <div className="page-container max-w-2xl mx-auto py-10">
                <h1 className="text-3xl font-black text-[var(--text-main)] mb-2 flex items-center gap-3">
                    <Settings size={28} className="text-[var(--color-primary)]" /> Configuración
                </h1>
                <p className="text-[var(--text-muted)] mb-8 text-sm">Gestiona tu cuenta y preferencias.</p>

                <div className="flex flex-col gap-6">

                    {/* ─── PERFIL ─── */}
                    <section className="rounded-2xl border border-[var(--border-subtle)] overflow-hidden"
                        style={{ background: 'var(--bg-panel)', backdropFilter: 'blur(20px)' }}>
                        <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center gap-3">
                            <User size={18} className="text-[var(--color-primary)]" />
                            <h2 className="font-bold text-[var(--text-main)]">Información Personal</h2>
                        </div>
                        <form onSubmit={handleSaveProfile} className="px-6 py-5 flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Nombre</label>
                                <input
                                    className="bg-[var(--input-bg)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-[var(--text-main)] text-sm outline-none focus:border-[var(--color-primary)] transition"
                                    value={form.name}
                                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Email</label>
                                <input
                                    className="bg-[var(--input-bg)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-[var(--text-muted)] text-sm outline-none cursor-not-allowed"
                                    value={form.email}
                                    disabled
                                />
                            </div>
                            <div className="border-t border-[var(--border-subtle)] pt-4 flex flex-col gap-1">
                                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Contraseña actual</label>
                                <input type="password" placeholder="••••••••"
                                    className="bg-[var(--input-bg)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-[var(--text-main)] text-sm outline-none focus:border-[var(--color-primary)] transition"
                                    value={form.currentPassword}
                                    onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))}
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Nueva Contraseña</label>
                                <input type="password" placeholder="Mínimo 8 caracteres"
                                    className="bg-[var(--input-bg)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-[var(--text-main)] text-sm outline-none focus:border-[var(--color-primary)] transition"
                                    value={form.newPassword}
                                    onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
                                />
                            </div>
                            {msg && <p className={`text-sm font-semibold ${msg.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}>{msg}</p>}
                            <button type="submit" disabled={saving}
                                className="mt-2 px-6 py-2.5 bg-[var(--color-primary)] text-black font-bold rounded-full hover:scale-105 transition disabled:opacity-50 self-start text-sm">
                                {saving ? 'Guardando...' : 'Guardar cambios'}
                            </button>
                        </form>
                    </section>

                    {/* ─── NOTIFICACIONES ─── */}
                    <section className="rounded-2xl border border-[var(--border-subtle)] overflow-hidden"
                        style={{ background: 'var(--bg-panel)', backdropFilter: 'blur(20px)' }}>
                        <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center gap-3">
                            <Bell size={18} className="text-[var(--color-primary)]" />
                            <h2 className="font-bold text-[var(--text-main)]">Notificaciones</h2>
                        </div>
                        <div className="px-6 py-5 flex flex-col gap-4 text-sm text-[var(--text-muted)]">
                            {[
                                { label: 'Nuevos estrenos', desc: 'Recibir notificación cuando se añadan nuevos contenidos' },
                                { label: 'Recordatorios de suscripción', desc: 'Alertas antes de que venza tu plan' },
                            ].map(opt => (
                                <div key={opt.label} className="flex items-center justify-between py-2 border-b border-[var(--border-subtle)] last:border-0">
                                    <div>
                                        <p className="font-semibold text-[var(--text-main)]">{opt.label}</p>
                                        <p className="text-xs">{opt.desc}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" defaultChecked className="sr-only peer" />
                                        <div className="w-10 h-5 bg-[var(--border-subtle)] rounded-full peer peer-checked:bg-[var(--color-primary)] transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ─── SECCIÓN RESELLER (solo revendedores) ─── */}
                    {isReseller && !isAdmin && (
                        <section className="rounded-2xl border border-[var(--color-primary)]/30 overflow-hidden"
                            style={{ background: 'rgba(255, 179, 0, 0.05)', backdropFilter: 'blur(20px)' }}>
                            <div className="px-6 py-4 border-b border-[var(--color-primary)]/20 flex items-center gap-3">
                                <Video size={18} className="text-[var(--color-primary)]" />
                                <h2 className="font-bold text-[var(--text-main)]">Panel Revendedor</h2>
                                <span className="ml-auto text-xs font-bold bg-[var(--color-primary)] text-black px-2 py-0.5 rounded-full">B2B</span>
                            </div>
                            <div className="px-6 py-5 flex flex-col gap-3">
                                <p className="text-sm text-[var(--text-muted)]">Accede a tus herramientas de revendedor, descarga de contenido y gestión de clientes.</p>
                                <Link href="/reseller/dashboard" className="flex items-center gap-2 px-5 py-3 bg-[var(--color-primary)] text-black font-bold rounded-xl hover:scale-105 transition text-sm self-start">
                                    Ir a mi Panel <ChevronRight size={16} />
                                </Link>
                            </div>
                        </section>
                    )}

                    {/* ─── SECCIÓN ADMIN ─── */}
                    {isAdmin && (
                        <section className="rounded-2xl border border-red-500/30 overflow-hidden"
                            style={{ background: 'rgba(239,68,68,0.05)', backdropFilter: 'blur(20px)' }}>
                            <div className="px-6 py-4 border-b border-red-500/20 flex items-center gap-3">
                                <Shield size={18} className="text-red-400" />
                                <h2 className="font-bold text-[var(--text-main)]">Panel de Administración</h2>
                                <span className="ml-auto text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">ADMIN</span>
                            </div>
                            <div className="px-6 py-5 flex flex-col gap-3">
                                <p className="text-sm text-[var(--text-muted)]">Accede al panel completo de administración del sistema.</p>
                                <Link href="/admin" className="flex items-center gap-2 px-5 py-3 bg-red-500 text-white font-bold rounded-xl hover:scale-105 transition text-sm self-start">
                                    Ir al Panel Admin <ChevronRight size={16} />
                                </Link>
                            </div>
                        </section>
                    )}

                    {/* ─── PERFILES ─── */}
                    <section className="rounded-2xl border border-[var(--border-subtle)] overflow-hidden"
                        style={{ background: 'var(--bg-panel)', backdropFilter: 'blur(20px)' }}>
                        <div className="px-6 py-4 flex items-center gap-3">
                            <User size={18} className="text-[var(--color-primary)]" />
                            <h2 className="font-bold text-[var(--text-main)]">Gestión de Perfiles</h2>
                        </div>
                        <div className="px-6 pb-5">
                            <p className="text-sm text-[var(--text-muted)] mb-3">Administra tus perfiles y configuración de control parental.</p>
                            <Link href="/perfiles" className="flex items-center gap-2 text-[var(--color-primary)] text-sm font-bold hover:underline">
                                Gestionar perfiles <ChevronRight size={14} />
                            </Link>
                        </div>
                    </section>

                </div>
            </div>
        </PublicLayout>
    );
}
