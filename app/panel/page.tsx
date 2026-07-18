'use client';

import { useAuth } from '@/context/AuthContext';
import { API_ROUTES } from '@/lib/api-routes';
import { userFetch } from '@/lib/api-client';
import { useState, useEffect } from 'react';
import PublicLayout from '@/components/layout/PublicLayout';
import { Wallet, Download, Clock, Play, Lock, ChevronRight, Coins } from 'lucide-react';
import Link from 'next/link';
import { resolveImageUrl } from '@/lib/api-routes';

export default function B2CPanelPage() {
    const { user } = useAuth();
    
    const [wallet, setWallet] = useState<{ balance: number, recentTransactions: any[] } | null>(null);
    const [downloads, setDownloads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        
        const fetchData = async () => {
            try {
                // Fetch Wallet
                const resWallet = await userFetch(API_ROUTES.TOKENS.WALLET);
                const jsonWallet = await resWallet.json();
                if (jsonWallet.success) setWallet(jsonWallet.data);

                // Fetch Downloads History
                const resDownloads = await userFetch(`${API_ROUTES.DOWNLOADS.HISTORY}?limit=10`);
                const jsonDownloads = await resDownloads.json();
                if (jsonDownloads.success) setDownloads(jsonDownloads.data || []);
            } catch (error) {
                console.error("Error loading panel data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (!user) {
        return (
            <PublicLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-[var(--text-muted)]">
                    <Lock size={48} className="opacity-40" />
                    <h2 className="text-xl font-bold text-[var(--text-main)]">Inicia sesión para ver tu Panel</h2>
                    <Link href="/auth/login" className="px-6 py-2.5 bg-[var(--color-primary)] text-black rounded-full font-bold hover:scale-105 transition">Iniciar Sesión</Link>
                </div>
            </PublicLayout>
        );
    }

    return (
        <PublicLayout>
            <div className="page-container max-w-5xl mx-auto py-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-[var(--text-main)] mb-2 flex items-center gap-3">
                            <Wallet size={32} className="text-[var(--color-primary)]" /> Panel de Cuenta
                        </h1>
                        <p className="text-[var(--text-muted)]">Administra tus tokens, descargas y beneficios de suscriptor.</p>
                    </div>
                    <Link href="/historial" className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all font-bold text-sm shadow-sm backdrop-blur-md">
                        <Clock size={18} className="text-[var(--color-primary)]" /> Historial de Visualización
                    </Link>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* ─── LEFT COLUMN (Tokens) ─── */}
                        <div className="lg:col-span-1 flex flex-col gap-6">
                            
                            {/* Wallet Balance */}
                            <section className="rounded-2xl border border-[var(--border-subtle)] overflow-hidden flex flex-col"
                                style={{ background: 'var(--bg-panel)', backdropFilter: 'blur(20px)' }}>
                                <div className="p-6 bg-gradient-to-br from-[var(--color-primary)]/10 to-transparent">
                                    <div className="flex items-center gap-2 text-[var(--color-primary)] font-bold mb-4 uppercase tracking-wider text-xs">
                                        <Coins size={16} /> Billetera de Tokens
                                    </div>
                                    <h2 className="text-5xl font-black text-[var(--text-main)] drop-shadow-md flex items-end gap-2">
                                        {wallet?.balance || 0} <span className="text-sm font-bold text-[var(--text-muted)] mb-2 uppercase">Tokens</span>
                                    </h2>
                                    <p className="text-xs text-[var(--text-muted)] mt-2">Gana 1 Token por cada hora que veas contenido en NexoPlay.</p>
                                    
                                    <div className="mt-6">
                                        <div className="w-full h-2 bg-[var(--bg-main)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
                                            <div className="h-full bg-[var(--color-primary)] transition-all duration-1000" style={{ width: `${Math.min(((wallet?.balance || 0) / 1000) * 100, 100)}%` }}></div>
                                        </div>
                                        <p className="text-xs text-[var(--text-muted)] mt-2 text-center">
                                            {wallet?.balance || 0} / 1000 para <strong className="text-[var(--color-primary)]">1 mes Gratis</strong>
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Recent Transactions */}
                            <section className="rounded-2xl border border-[var(--border-subtle)] overflow-hidden"
                                style={{ background: 'var(--bg-panel)', backdropFilter: 'blur(20px)' }}>
                                <div className="px-5 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
                                    <h3 className="font-bold text-[var(--text-main)] text-sm">Transacciones</h3>
                                </div>
                                <div className="p-0">
                                    {wallet?.recentTransactions && wallet.recentTransactions.length > 0 ? (
                                        <div className="flex flex-col">
                                            {wallet.recentTransactions.slice(0, 5).map((tx, idx) => (
                                                <div key={idx} className="flex items-center justify-between px-5 py-3 border-b border-[var(--border-subtle)] last:border-0">
                                                    <div>
                                                        <p className="text-sm font-semibold text-[var(--text-main)]">{tx.type === 'EARNED_WATCHTIME' ? 'Ganado por ver contenido' : tx.type}</p>
                                                        <p className="text-xs text-[var(--text-muted)]">{new Date(tx.createdAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                                    </div>
                                                    <span className={`font-bold ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="px-5 py-8 text-center text-sm text-[var(--text-muted)]">
                                            Aún no tienes movimientos.
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>

                        {/* ─── RIGHT COLUMN (Downloads) ─── */}
                        <div className="lg:col-span-2 flex flex-col gap-6">
                            <section className="rounded-2xl border border-[var(--border-subtle)] overflow-hidden h-full flex flex-col"
                                style={{ background: 'var(--bg-panel)', backdropFilter: 'blur(20px)' }}>
                                <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center gap-3">
                                    <Download size={18} className="text-emerald-400" />
                                    <h2 className="font-bold text-[var(--text-main)]">Mis Descargas (Historial)</h2>
                                </div>
                                
                                <div className="p-0 flex-1">
                                    {downloads && downloads.length > 0 ? (
                                        <div className="flex flex-col">
                                            {downloads.map((dl, idx) => (
                                                <Link href={`/film/${dl.slug}`} key={idx} className="flex items-center gap-4 px-6 py-4 border-b border-[var(--border-subtle)] last:border-0 hover:bg-white/5 transition group">
                                                    <div className="w-12 h-16 bg-[var(--bg-main)] rounded-md overflow-hidden shrink-0 border border-[var(--border-strong)] relative">
                                                        {dl.posterUrl ? (
                                                            <img src={resolveImageUrl(dl.posterUrl)} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                                                                <Play size={16} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-[var(--text-main)] truncate text-sm md:text-base group-hover:text-[var(--color-primary)] transition-colors">{dl.contentTitle}</h4>
                                                        <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-muted)]">
                                                            <span className="flex items-center gap-1"><Clock size={12} /> {new Date(dl.downloadedAt).toLocaleDateString()}</span>
                                                            <span className="uppercase font-bold tracking-wide">{dl.quality || 'Auto'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="shrink-0 flex items-center gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                                        <span className="hidden md:inline text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">Ver Detalle</span>
                                                        <ChevronRight size={16} className="text-[var(--text-main)]" />
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full py-12 text-center px-4">
                                            <div className="w-16 h-16 rounded-full bg-[var(--bg-main)] flex items-center justify-center border border-[var(--border-strong)] mb-4">
                                                <Download size={24} className="text-[var(--text-muted)]" />
                                            </div>
                                            <h3 className="font-bold text-[var(--text-main)] mb-2">No has descargado nada aún</h3>
                                            <p className="text-sm text-[var(--text-muted)] max-w-sm">
                                                Usa el botón de descargar en las películas o series para verlas sin conexión, y aparecerán en este historial.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>

                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
