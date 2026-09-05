'use client';

import PublicLayout from '@/components/layout/PublicLayout';
import { useAuth } from '@/context/AuthContext';
import { userFetch } from '@/lib/api-client';
import { API_ROUTES, resolveImageUrl } from '@/lib/api-routes';
import { Clock, Coins, Download, Lock, Play, Trash2, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function B2CPanelPage() {
    const { user } = useAuth();
    
    const [wallet, setWallet] = useState<{ balance: number, recentTransactions: any[] } | null>(null);
    const [downloads, setDownloads] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!user) return;
        try {
            // Fetch Wallet
            const resWallet = await userFetch(API_ROUTES.TOKENS.WALLET);
            const jsonWallet = await resWallet.json();
            if (jsonWallet.success) setWallet(jsonWallet.data);

            // Fetch content based on role
            const endpoint = user.role === 'GUEST' ? API_ROUTES.DOWNLOADS.LIBRARY : API_ROUTES.DOWNLOADS.HISTORY;
            const resDownloads = await userFetch(`${endpoint}?limit=20`);
            const jsonDownloads = await resDownloads.json();
            if (jsonDownloads.success) {
                const rawDownloads = jsonDownloads.data || [];
                const uniqueDownloads = Array.from(new Map(rawDownloads.map((item: any) => [item.slug, item])).values());
                setDownloads(uniqueDownloads as any[]);
            }

            const profileId = localStorage.getItem('nexo_active_profile_id');
            const accessToken = localStorage.getItem('nexo_access_token');
            
            if (profileId && accessToken) {
                // Fetch History
                const resHist = await userFetch(API_ROUTES.HISTORY.BASE, {
                    headers: { 'X-Profile-Id': profileId }
                });
                const jsonHist = await resHist.json();
                if (jsonHist.data) setHistory(jsonHist.data);
            }
        } catch (error) {
            console.error("Error loading panel data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const handleDeleteHistory = async (e: React.MouseEvent, contentId: string) => {
        e.preventDefault();
        e.stopPropagation();
        const profileId = localStorage.getItem('nexo_active_profile_id');
        if (!profileId) return;

        setHistory(prev => prev.filter(item => item.content?.id !== contentId));
        try {
            await userFetch(`${API_ROUTES.HISTORY.BASE}/${contentId}`, {
                method: 'DELETE',
                headers: { 'X-Profile-Id': profileId }
            });
        } catch (err) {
            console.error(err);
            fetchData();
        }
    };



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

    const isSubscriber = user.role === 'SUBSCRIBER';

    return (
        <PublicLayout>
            <div className="page-container max-w-5xl mx-auto py-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-[var(--text-main)] mb-2 flex items-center gap-3">
                            <Wallet size={32} className="text-[var(--color-primary)]" /> Panel de Cuenta
                        </h1>
                        <p className="text-[var(--text-muted)]">Administra tus créditos, descargas y beneficios.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin"></div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-10">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* ─── LEFT COLUMN (Tokens) ─── */}
                            <div className="lg:col-span-1 flex flex-col gap-6">
                                {/* Wallet Balance */}
                                <section className="rounded-2xl border border-[var(--border-subtle)] overflow-hidden flex flex-col"
                                    style={{ background: 'var(--bg-panel)', backdropFilter: 'blur(20px)' }}>
                                    <div className="p-6 bg-gradient-to-br from-[var(--color-primary)]/10 to-transparent">
                                        <div className="flex items-center gap-2 text-[var(--color-primary)] font-bold mb-4 uppercase tracking-wider text-xs">
                                            <Coins size={16} /> Billetera de Créditos
                                        </div>
                                        <h2 className="text-5xl font-black text-[var(--text-main)] drop-shadow-md flex items-end gap-2">
                                            {wallet?.balance || 0} <span className="text-sm font-bold text-[var(--text-muted)] mb-2 uppercase">Créditos</span>
                                        </h2>
                                        <p className="text-xs text-[var(--text-muted)] mt-2">Gana 1 Crédito por cada hora que veas contenido en Vexa.</p>
                                    </div>
                                </section>
                            </div>

                            {/* ─── RIGHT COLUMN (Downloads / Guardados) ─── */}
                            <div className="lg:col-span-2 flex flex-col gap-6">
                                <section className="rounded-2xl border border-[var(--border-subtle)] overflow-hidden h-full flex flex-col"
                                    style={{ background: 'var(--bg-panel)', backdropFilter: 'blur(20px)' }}>
                                    <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center gap-3">
                                        <Download size={18} className="text-[var(--color-primary)]" />
                                        <h2 className="font-bold text-[var(--text-main)]">
                                            {isSubscriber ? "Guardado para ver sin conexión" : "Mi Contenido Desbloqueado"}
                                        </h2>
                                    </div>
                                    
                                    <div className="p-0 flex-1">
                                        {downloads && downloads.length > 0 ? (
                                            <div className="flex flex-col">
                                                {downloads.map((dl, idx) => (
                                                    <div key={idx} className="flex items-center gap-4 px-6 py-4 border-b border-[var(--border-subtle)] last:border-0 hover:bg-white/5 transition group">
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
                                                            <Link href={`/film/${dl.slug}`}>
                                                                <h4 className="font-bold text-[var(--text-main)] truncate text-sm md:text-base group-hover:text-[var(--color-primary)] transition-colors">{dl.contentTitle}</h4>
                                                            </Link>
                                                            <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-muted)]">
                                                                {dl.downloadedAt ? (
                                                                    <span className="flex items-center gap-1"><Clock size={12} /> Descargado el {new Date(dl.downloadedAt).toLocaleDateString()}</span>
                                                                ) : (
                                                                    <span className="flex items-center gap-1"><Lock size={12} className="text-green-400" /> Desbloqueado el {new Date(dl.usedAt).toLocaleDateString()}</span>
                                                                )}
                                                                {dl.quality && <span className="uppercase font-bold tracking-wide">{dl.quality}</span>}
                                                            </div>
                                                        </div>
                                                        {/* Play button for everyone */}
                                                        <Link href={`/film/${dl.slug}/watch`} className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-primary)] text-black hover:scale-110 transition-transform">
                                                            <Play size={18} className="ml-1" />
                                                        </Link>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full py-12 text-center px-4">
                                                <div className="w-16 h-16 rounded-full bg-[var(--bg-main)] flex items-center justify-center border border-[var(--border-strong)] mb-4">
                                                    <Download size={24} className="text-[var(--text-muted)]" />
                                                </div>
                                                <h3 className="font-bold text-[var(--text-main)] mb-2">
                                                    {isSubscriber ? "No tienes descargas aún" : "No tienes contenido desbloqueado"}
                                                </h3>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </div>
                        </div>

                        {/* ─── HISTORY SECTION ─── */}
                        <section className="rounded-2xl border border-[var(--border-subtle)] overflow-hidden flex flex-col"
                            style={{ background: 'var(--bg-panel)', backdropFilter: 'blur(20px)' }}>
                            <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center gap-3">
                                <Clock size={18} className="text-[var(--color-primary)]" />
                                <h2 className="font-bold text-[var(--text-main)]">Historial de Visualización</h2>
                            </div>
                            <div className="p-6">
                                {history && history.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                        {history.map(item => {
                                            const c = item.content;
                                            const poster = c.thumbnails?.find((t: any) => t.type === 'POSTER')?.url || '';
                                            return (
                                                <Link href={`/film/${c.id}`} key={c.id} className="block group relative aspect-[2/3] w-full bg-[var(--bg-main)] rounded-lg overflow-hidden shadow-xl border border-[var(--border-subtle)] hover:border-[var(--color-primary)] transition-colors">
                                                    <img src={resolveImageUrl(poster)} alt={c.translations?.[0]?.title} className="w-full h-full object-cover group-hover:brightness-110 transition" />
                                                    <button onClick={(e) => handleDeleteHistory(e, c.id)} className="absolute top-2 right-2 p-2 bg-black/60 rounded-full text-white/50 hover:text-red-500 hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-sm text-[var(--text-muted)]">No hay historial de visualización reciente.</p>
                                )}
                            </div>
                        </section>



                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
