'use client';
import { useEffect, useState } from 'react';
import { CheckCircle2, Coins, TrendingDown, TrendingUp, Zap, XCircle } from 'lucide-react';
import { API, apiFetch } from '@/lib/api';

export default function ResellerTokensPage() {
  const [wallet, setWallet] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [amount, setAmount] = useState(10);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3500); };

  const load = async () => {
    const [w, h] = await Promise.all([
      apiFetch(API.TOKENS.WALLET).catch(() => null),
      apiFetch(`${API.TOKENS.HISTORY}?limit=30`).catch(() => null),
    ]);
    if (w?.data) setWallet(w.data);
    if (h?.data) setHistory(h.data.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleBuy = async () => {
    if (amount <= 0) return;
    if (!confirm(`¿Comprar ${amount} descargas extra por ${amount * 10} tokens?`)) return;
    setBuying(true);
    try {
      const res = await API.RESELLER.buyLimits(amount);
      if (res.success) { showToast(`Compraste ${amount} descargas extra`); load(); }
      else showToast(res.error || 'Error', false);
    } catch (e: any) { showToast(e.message || 'Error', false); }
    finally { setBuying(false); }
  };

  const TX_ICON = (type: string, amount: number) => {
    if (amount > 0) return <TrendingUp size={16} className="text-green-400" />;
    return <TrendingDown size={16} className="text-red-400" />;
  };

  const TX_LABEL: Record<string, string> = {
    EARNED: 'Ganado', PURCHASED: 'Comprado', ADMIN_GRANT: 'Otorgado por Admin',
    RECEIVED_GIFT: 'Regalo recibido', SPENT: 'Gastado', GIFTED: 'Regalado', ADMIN_DEDUCT: 'Deducido',
  };

  return (
    <div className="p-6 sm:p-8">
      {toast && (
        <div className="fixed top-5 right-5 z-[200] px-4 py-3 rounded-xl text-sm font-bold shadow-2xl flex items-center gap-2"
          style={{ background: toast.ok ? '#34D399' : '#EF4444', color: '#0a0f0a' }}>
          {toast.ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />} {toast.msg}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <Coins size={28} style={{ color: '#EAB308' }} /> Mis Tokens
        </h1>
        <p className="text-sm mt-1" style={{ color: '#6B7280' }}>Usá tokens para comprar descargas extra</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Balance */}
        <div className="rounded-[20px] border border-white/5 p-8 relative overflow-hidden" style={{ background: 'var(--bg-panel)' }}>
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #EAB308 0%, transparent 70%)', filter: 'blur(30px)', transform: 'translate(30%,-30%)' }} />
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(234,179,8,0.15)', color: '#EAB308', border: '1px solid rgba(234,179,8,0.3)' }}>
            <Coins size={26} />
          </div>
          <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#6B7280' }}>Saldo actual</p>
          <p className="text-6xl font-black text-white mb-1">{loading ? '…' : (wallet?.balance ?? 0)}</p>
          <p className="text-sm" style={{ color: '#6B7280' }}>tokens disponibles</p>
        </div>

        {/* Buy extra downloads */}
        <div className="rounded-[20px] border border-white/5 p-8" style={{ background: 'var(--bg-panel)' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(52,211,153,0.15)', color: '#34D399', border: '1px solid rgba(52,211,153,0.3)' }}>
            <Zap size={26} />
          </div>
          <p className="font-black text-white mb-1">Comprar descargas extra</p>
          <p className="text-xs mb-5" style={{ color: '#6B7280' }}>Cada descarga extra cuesta 10 tokens</p>
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => setAmount(a => Math.max(1, a - 1))} className="w-10 h-10 rounded-xl font-black text-white transition-colors hover:bg-white/10" style={{ background: 'rgba(255,255,255,0.05)' }}>−</button>
            <span className="text-3xl font-black text-white w-16 text-center">{amount}</span>
            <button onClick={() => setAmount(a => a + 1)} className="w-10 h-10 rounded-xl font-black text-white transition-colors hover:bg-white/10" style={{ background: 'rgba(255,255,255,0.05)' }}>+</button>
          </div>
          <p className="text-xs mb-4" style={{ color: '#6B7280' }}>Costo: <span className="font-black text-white">{amount * 10} tokens</span></p>
          <button onClick={handleBuy} disabled={buying || (wallet?.balance ?? 0) < amount * 10}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: '#34D399', color: '#0a0f0a' }}>
            {buying ? <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#0a0f0a', borderTopColor: 'transparent' }} />
              : <><Zap size={16} /> Comprar {amount} descarga{amount > 1 ? 's' : ''}</>}
          </button>
        </div>
      </div>

      {/* Transaction history */}
      <div>
        <h2 className="font-black text-white text-lg mb-4 flex items-center gap-2">
          <Coins size={18} style={{ color: '#EAB308' }} /> Historial de transacciones
        </h2>
        <div className="rounded-2xl border border-white/5 overflow-hidden" style={{ background: 'var(--bg-panel)' }}>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-48 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
                  <div className="h-3 w-24 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
                </div>
              </div>
            ))
          ) : history.length === 0 ? (
            <div className="py-16 text-center">
              <Coins size={40} className="mx-auto mb-3 opacity-20 text-white" />
              <p style={{ color: '#6B7280' }}>Sin transacciones aún</p>
            </div>
          ) : history.map((tx, i) => {
            const isPositive = tx.amount > 0;
            // Skip internal tracker records (amount=0)
            if (tx.amount === 0) return null;
            return (
              <div key={tx.id} className="px-5 py-4 flex items-center justify-between gap-4"
                style={{ borderTop: i > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: isPositive ? 'rgba(52,211,153,0.1)' : 'rgba(239,68,68,0.1)' }}>
                    {TX_ICON(tx.type, tx.amount)}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{TX_LABEL[tx.type] || tx.type}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
                      {tx.description?.startsWith('BONUS_DOWNLOADS:') ? `${tx.description.split(':')[1]} descargas extras compradas` : tx.description}
                    </p>
                    <p className="text-[11px]" style={{ color: '#4B5563' }}>
                      {new Date(tx.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <span className={`font-black text-base ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {isPositive ? '+' : ''}{tx.amount}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
