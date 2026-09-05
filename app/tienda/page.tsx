'use client';

import { useState, useEffect, useCallback } from 'react';
import { Crown, Coins, MessageCircle, ChevronRight, Check, ArrowLeft, History, Zap, Gift, Star, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { userFetch } from '@/lib/api-client';
import { API_ROUTES } from '@/lib/api-routes';
import Link from 'next/link';
import PublicLayout from '@/components/layout/PublicLayout';

interface Plan {
  id: string;
  name: string;
  description: string;
  tokenCost: number;
  durationDays: number;
  role: string;
  tier: string;
  weeklyOfflineLimit: number;
  dailyDownloadLimit: number;
  unlimitedDownloads: boolean;
  showAds: boolean;
  canWatch: boolean;
  canDownload: boolean;
}

interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  priceUSD: string;
  isActive: boolean;
  sortOrder: number;
}

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
}

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5491122334455';

function typeLabel(type: string) {
  const map: Record<string, string> = {
    EARNED: '🎁 Recompensa',
    PURCHASED: '🛒 Comprado',
    ADMIN_GRANT: '⚙️ Admin',
    RECEIVED_GIFT: '🎀 Regalo',
    SPENT: '💸 Gasto',
    GIFTED: '🎀 Regalado',
    ADMIN_DEDUCT: '⚙️ Deducción',
    SUBSCRIPTION_PAYMENT: '📺 Suscripción',
  };
  return map[type] || type;
}

import { useRouter } from 'next/navigation';

export default function TiendaPage() {
  const { user, isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'planes' | 'tokens' | 'historial'>('planes');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [packages, setPackages] = useState<TokenPackage[]>([]);
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [walletRes, plansRes, packagesRes] = await Promise.all([
        userFetch(API_ROUTES.TOKENS.WALLET).then(r => r.ok ? r.json() : null).catch(() => null),
        userFetch(API_ROUTES.TOKENS.PLANS).then(r => r.ok ? r.json() : null).catch(() => null),
        userFetch(API_ROUTES.TOKENS.PACKAGES).then(r => r.ok ? r.json() : null).catch(() => null),
      ]);

      if (walletRes?.success) setTokenBalance(walletRes.data?.balance ?? 0);
      if (plansRes?.success && Array.isArray(plansRes.data)) setPlans(plansRes.data);
      if (packagesRes?.success && Array.isArray(packagesRes.data)) setPackages(packagesRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await userFetch(`${API_ROUTES.TOKENS.HISTORY}?limit=20`);
      const json = await res.json();
      if (json.success) setTransactions(json.data?.data ?? []);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { if (activeTab === 'historial') fetchHistory(); }, [activeTab, fetchHistory]);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/auth/login');
    }
  }, [isLoading, isLoggedIn, router]);

  if (isLoading || !isLoggedIn) {
    return (
      <PublicLayout hideSidebar={true}>
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)]">
          <div className="w-10 h-10 border-4 border-white/20 border-t-[var(--color-primary)] rounded-full animate-spin" />
        </div>
      </PublicLayout>
    );
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleBuyPlan = async (plan: Plan) => {
    if (!user) { showMessage('error', 'Debes iniciar sesión para comprar un plan.'); return; }
    const cost = plan.tokenCost;
    if (tokenBalance < cost) {
      showMessage('error', `Créditos insuficientes. Este plan cuesta ${cost}C y tienes ${tokenBalance}C.`);
      setActiveTab('tokens');
      return;
    }
    if (!confirm(`¿Confirmar compra de "${plan.name}" por ${cost} créditos? Tendrás acceso por ${plan.durationDays} días.`)) return;

    setBuying(plan.id);
    try {
      const res = await userFetch(API_ROUTES.TOKENS.BUY_SUBSCRIPTION, {
        method: 'POST',
        body: JSON.stringify({ planId: plan.id }),
      });
      const json = await res.json();
      if (json.success) {
        showMessage('success', `¡Suscripción "${plan.name}" adquirida! Tienes acceso por ${plan.durationDays} días.`);
        fetchData();
      } else {
        showMessage('error', json.error || 'Error al procesar la compra.');
      }
    } catch (e: any) {
      showMessage('error', e.message || 'Error de conexión.');
    } finally {
      setBuying(null);
    }
  };

  const handleBuyTokens = (pkg: TokenPackage) => {
    const msg = `Hola, quiero comprar el paquete *${pkg.name}* (${pkg.tokens} Créditos) por $${pkg.priceUSD} USD.\nMi email de cuenta: ${user?.email || 'Sin cuenta'}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const planFeatures = (plan: Plan) => {
    const features = [];
    if (plan.canWatch) features.push('✅ Ver contenido online');
    
    if (plan.role === 'SUBSCRIBER') {
      features.push(`✅ Guardar offline (${plan.weeklyOfflineLimit}/semana)`);
      if (plan.showAds) features.push('⚠️ Con anuncios publicitarios');
      else features.push('🚫 Sin anuncios publicitarios');
    }
    
    if (plan.role === 'RESELLER') {
      if (plan.unlimitedDownloads) features.push('✅ Descargas B2B ilimitadas');
      else features.push(`✅ Descargas B2B (${plan.dailyDownloadLimit}/día)`);
      features.push('🚫 Sin anuncios publicitarios');
    }
    
    return features;
  };

  return (
    <PublicLayout>
    <div className="min-h-screen" style={{ background: 'var(--bg-main)' }}>
      {/* Header */}
      <div className="relative pt-24 pb-12 overflow-hidden border-b border-white/10"
        style={{ background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a1a2e 100%)' }}>
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full blur-[120px] opacity-20"
          style={{ background: 'var(--color-primary)' }} />
        <div className="absolute top-10 left-1/3 w-64 h-64 rounded-full blur-[100px] opacity-10"
          style={{ background: '#06b6d4' }} />

        <div className="relative z-10 max-w-5xl mx-auto px-6">
          <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft size={16} /> Volver
          </Link>

          {/* Token Balance */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[4px] mb-2" style={{ color: 'var(--color-primary)' }}>Tienda</p>
              <h1 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tight">Créditos & Planes</h1>
              <p className="text-white/50 mt-2 text-sm">Con créditos puedes comprar suscripciones, películas sueltas y más.</p>
            </div>

            {user && (
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-4">
                <Coins size={28} style={{ color: '#f59e0b' }} />
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-widest">Tu saldo</p>
                  <p className="text-3xl font-black text-white">{tokenBalance.toLocaleString()} <span className="text-lg font-bold" style={{ color: '#f59e0b' }}>C</span></p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notification */}
      {message && (
        <div className={`fixed top-24 right-6 z-[999] max-w-sm px-5 py-4 rounded-2xl border shadow-2xl flex items-start gap-3 transition-all ${message.type === 'success' ? 'bg-green-900/90 border-green-500/30 text-green-200' : 'bg-red-900/90 border-red-500/30 text-red-200'}`}>
          {message.type === 'success' ? <Check size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-5xl mx-auto px-6 pt-8">
        <div className="flex gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 w-fit mb-8">
          {[
            { key: 'planes', label: 'Suscripciones', icon: Crown },
            { key: 'tokens', label: 'Paquetes de Créditos', icon: Coins },
            { key: 'historial', label: 'Mi Historial', icon: History },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${activeTab === key ? 'text-white shadow-lg' : 'text-white/40 hover:text-white/70'}`}
              style={activeTab === key ? { background: 'var(--color-primary)' } : {}}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-white/60 animate-spin" />
          </div>
        ) : (
          <>
            {/* ── PLANS TAB ── */}
            {activeTab === 'planes' && (
              <div>
                <p className="text-white/50 text-sm mb-6">
                  Paga tu suscripción usando tus créditos. No se necesita tarjeta de crédito.<br />
                  Para recargar créditos, ve a la pestaña <strong className="text-white">Paquetes de Créditos</strong>.
                </p>

                {plans.length === 0 ? (
                  <div className="text-center py-16 text-white/30">No hay planes disponibles.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {plans.filter(p => {
                      if (!user || user.role === 'SUBSCRIBER' || user.role === 'GUEST') return p.role === 'SUBSCRIBER';
                      if (user.role === 'RESELLER') return p.role === 'RESELLER';
                      return true; // ADMIN and FRANCHISEE see all plans
                    }).map((plan) => {
                      const cost = plan.tokenCost;
                      const canAfford = tokenBalance >= cost;
                      const isCurrentPlan = (user as any)?.subscription?.plan?.id === plan.id;
                      return (
                        <div
                          key={plan.id}
                          className={`relative rounded-3xl border p-6 flex flex-col transition-all ${plan.tier === 'PREMIUM' ? 'border-yellow-500/40 bg-gradient-to-br from-yellow-900/20 to-black/40' : 'border-white/10 bg-white/5'}`}
                        >
                          {plan.tier === 'PREMIUM' && (
                            <div className="absolute -top-3 left-6 bg-yellow-500 text-black text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                              ⭐ Mejor Valor
                            </div>
                          )}
                          {isCurrentPlan && (
                            <div className="absolute -top-3 right-6 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider" style={{ background: 'var(--color-primary)' }}>
                              ✓ Tu Plan
                            </div>
                          )}

                          <h3 className="text-xl font-black text-white mb-1">{plan.name}</h3>
                          <p className="text-white/40 text-xs mb-4">{plan.description}</p>

                          <div className="flex items-baseline gap-2 mb-6">
                            <span className="text-4xl font-black" style={{ color: '#f59e0b' }}>{cost}</span>
                            <span className="text-lg font-bold text-white/60">T</span>
                            <span className="text-white/30 text-sm">/ {plan.durationDays} días</span>
                          </div>

                          <ul className="flex flex-col gap-2 mb-6 flex-1">
                            {planFeatures(plan).map((f, i) => (
                              <li key={i} className="text-sm text-white/70">{f}</li>
                            ))}
                          </ul>

                          <button
                            onClick={() => handleBuyPlan(plan)}
                            disabled={!canAfford || buying === plan.id || isCurrentPlan}
                            className={`w-full py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${isCurrentPlan ? 'bg-white/10 text-white/30 cursor-default' : canAfford ? 'text-white hover:opacity-90 active:scale-95' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
                            style={!isCurrentPlan && canAfford ? { background: 'var(--color-primary)' } : {}}
                          >
                            {buying === plan.id ? (
                              <span className="inline-block w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            ) : isCurrentPlan ? '✓ Plan Activo' : canAfford ? `Suscribirse por ${cost}C` : `Necesitas ${cost - tokenBalance}C más`}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ── TOKEN PACKAGES TAB ── */}
            {activeTab === 'tokens' && (
              <div>
                <div className="bg-amber-900/20 border border-amber-500/20 rounded-2xl p-5 mb-8 flex items-start gap-4">
                  <MessageCircle size={24} className="shrink-0 mt-0.5 text-amber-400" />
                  <div>
                    <p className="text-amber-200 font-bold mb-1">Pago vía WhatsApp</p>
                    <p className="text-amber-200/70 text-sm">
                      Al hacer clic en un paquete, se abrirá WhatsApp con el mensaje listo. 
                      El administrador confirmará el pago y acreditará los créditos en tu cuenta.
                    </p>
                  </div>
                </div>

                {packages.length === 0 ? (
                  <div className="text-center py-16 text-white/30">No hay paquetes de créditos disponibles.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
                    {packages.map((pkg) => (
                      <button
                        key={pkg.id}
                        onClick={() => handleBuyTokens(pkg)}
                        className="group rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 p-6 text-left transition-all flex flex-col gap-4"
                      >
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.15)' }}>
                          <Coins size={24} style={{ color: '#f59e0b' }} />
                        </div>
                        <div>
                          <p className="text-2xl font-black text-white">{pkg.tokens.toLocaleString()}<span className="text-sm font-bold text-amber-400 ml-1">C</span></p>
                          <p className="text-white/40 text-xs mt-1">{pkg.name}</p>
                        </div>
                        <div className="mt-auto">
                          <p className="text-xl font-black" style={{ color: 'var(--color-primary)' }}>${pkg.priceUSD} <span className="text-sm font-medium text-white/40">USD</span></p>
                          <p className="text-xs text-white/40 mt-1 flex items-center gap-1 group-hover:text-green-400 transition-colors">
                            <MessageCircle size={12} /> Contactar por WhatsApp
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <h3 className="font-black text-white mb-3 flex items-center gap-2"><Zap size={18} style={{ color: 'var(--color-primary)' }} /> ¿Cómo ganar créditos gratis?</h3>
                  <ul className="text-sm text-white/60 space-y-2 mb-6">
                    <li>🎬 <strong className="text-white/80">Ver contenido</strong> — Gana <strong className="text-white">1 crédito cada 10 minutos</strong> que veas. El contador se acumula por contenido y se reinicia cada 24hs.</li>
                    <li>📦 <strong className="text-white/80">Comprar paquetes</strong> — Adquirí créditos directamente desde la pestaña de arriba y usalos para activar cualquier suscripción.</li>
                  </ul>
                </div>
              </div>
            )}

            {/* ── HISTORY TAB ── */}
            {activeTab === 'historial' && (
              <div>
                {!user ? (
                  <div className="text-center py-16 text-white/30">Inicia sesión para ver tu historial.</div>
                ) : transactions.length === 0 ? (
                  <div className="text-center py-16 text-white/30">
                    <History size={48} className="mx-auto mb-4 opacity-30" />
                    <p>No hay transacciones aún. ¡Ve contenido para ganar tus primeros créditos!</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${tx.amount > 0 ? 'bg-green-900/40' : 'bg-red-900/40'}`}>
                            {tx.amount > 0 ? '📈' : '📉'}
                          </div>
                          <div>
                            <p className="text-white font-semibold text-sm">{tx.description}</p>
                            <p className="text-white/40 text-xs">{typeLabel(tx.type)} · {new Date(tx.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                          </div>
                        </div>
                        <span className={`font-black text-lg ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {tx.amount > 0 ? '+' : ''}{tx.amount} T
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
    </PublicLayout>
  );
}
