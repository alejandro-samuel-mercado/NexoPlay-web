'use client';

import { useState, useEffect } from 'react';
import { Crown, Coins, MessageCircle, ChevronRight, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { API, apiFetch } from '@/lib/api';

export default function TiendaPage() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'planes' | 'tokens'>('planes');
  const [plans, setPlans] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // El número de WhatsApp del administrador (puedes ajustarlo o traerlo de configuración)
  const whatsappNumber = '5491122334455'; 

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch plans
        const resPlans = await apiFetch(API.TOKENS.PACKAGES.replace('/packages', '/plans'));
        if (resPlans.success) setPlans(resPlans.data || []);
        
        // Fetch token packages
        const resPackages = await apiFetch(API.TOKENS.PACKAGES);
        if (resPackages.success) setPackages(resPackages.data || []);
      } catch (err) {
        console.error('Error fetching store data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleBuyPlan = async (plan: any) => {
    if (!user) return alert('Debes iniciar sesión para comprar un plan.');
    
    // Asumimos que los tokens están en (user as any).wallet?.balance
    // Si no lo tenemos a mano, simplemente intentamos y que el backend tire error de saldo
    const balance = (user as any).wallet?.balance || 0;
    
    if (balance < plan.price) {
      alert(`No tienes suficientes tokens. Este plan cuesta ${plan.price} y tienes ${balance}. Ve a la pestaña 'Tokens' para recargar.`);
      setActiveTab('tokens');
      return;
    }

    if (!confirm(`¿Estás seguro que deseas suscribirte a "${plan.name}" por ${plan.price} tokens?`)) return;

    try {
      const res = await apiFetch(API.TOKENS.BUY_SUBSCRIPTION, {
        method: 'POST',
        body: JSON.stringify({ planId: plan.id })
      });
      if (res.success) {
        alert('¡Suscripción adquirida con éxito!');
        refreshUser(); // Recargar datos del usuario para actualizar tokens y suscripción
      }
    } catch (err: any) {
      alert(err.message || 'Error al procesar la compra.');
    }
  };

  const handleBuyTokens = (pkg: any) => {
    const msg = `Hola, quiero comprar el paquete de ${pkg.tokens} Tokens (${pkg.name}) por $${pkg.priceUSD} USD. Mi email de cuenta es: ${user?.email || ''}`;
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-main)' }}>
      {/* Header */}
      <div className="relative pt-24 pb-12 overflow-hidden border-b-[3px] border-[#3A3A5C]"
           style={{ background: 'var(--bg-panel)' }}>
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full blur-[100px] opacity-20"
               style={{ background: 'var(--clay-purple)' }}></div>
          <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full blur-[100px] opacity-20"
               style={{ background: 'var(--clay-yellow)' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 mb-6"
               style={{ borderColor: 'var(--clay-teal)', background: 'rgba(0,210,180,0.1)' }}>
            <Crown size={16} style={{ color: 'var(--clay-teal)' }} />
            <span className="text-sm font-bold text-white tracking-wide uppercase">Tienda Oficial</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Mejora tu experiencia
          </h1>
          <p className="text-[#A8B3C8] text-lg max-w-2xl mx-auto font-medium">
            Adquiere planes de suscripción usando tus tokens o compra nuevos paquetes de tokens para acceder a más beneficios.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-[#252540] p-1.5 rounded-2xl border-[2px] border-[#3A3A5C]">
            <button 
              onClick={() => setActiveTab('planes')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'planes' ? 'bg-[#3A3A5C] text-white shadow-lg' : 'text-[#A8B3C8] hover:text-white'}`}
            >
              <Crown size={18} /> Planes
            </button>
            <button 
              onClick={() => setActiveTab('tokens')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === 'tokens' ? 'bg-[#3A3A5C] text-white shadow-lg' : 'text-[#A8B3C8] hover:text-white'}`}
            >
              <Coins size={18} /> Tokens
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-96 clay-skeleton rounded-3xl"></div>)}
          </div>
        ) : activeTab === 'planes' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map(plan => (
              <div key={plan.id} className="relative clay-card-dark rounded-3xl p-8 border-[3px] border-[#3A3A5C] flex flex-col hover:-translate-y-2 transition-all duration-300"
                   style={{ boxShadow: '6px 6px 0px #1A1A2E' }}>
                <div className="mb-6">
                  <h3 className="text-2xl font-black text-white mb-2">{plan.name}</h3>
                  <p className="text-[#A8B3C8] min-h-[48px]">{plan.description}</p>
                </div>
                
                <div className="mb-6 pb-6 border-b-[2px] border-[#3A3A5C]">
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black text-white">{plan.price}</span>
                    <span className="text-xl font-bold text-[#A8B3C8] mb-1">Tokens</span>
                  </div>
                  <span className="text-sm font-semibold text-[var(--clay-teal)]">por {plan.durationDays} días</span>
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[var(--clay-teal)]/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={12} className="text-[var(--clay-teal)]" />
                    </div>
                    <span className="text-[#E2E8F0] font-medium">{plan.credits} Créditos para descargas (B2C)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[var(--clay-teal)]/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={12} className="text-[var(--clay-teal)]" />
                    </div>
                    <span className="text-[#E2E8F0] font-medium">{plan.dailyLimit} Descargas diarias (B2B)</span>
                  </li>
                  {plan.has4k && (
                    <li className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-[var(--clay-yellow)]/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={12} className="text-[var(--clay-yellow)]" />
                      </div>
                      <span className="text-[#E2E8F0] font-medium">Resolución 4K Ultra HD</span>
                    </li>
                  )}
                </ul>

                <button 
                  onClick={() => handleBuyPlan(plan)}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-white hover:opacity-90 transition-opacity"
                  style={{ background: 'var(--clay-purple)', boxShadow: '0 4px 14px 0 rgba(168, 85, 247, 0.39)' }}
                >
                  Adquirir Plan <ChevronRight size={20} />
                </button>
              </div>
            ))}
            {plans.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-[#A8B3C8] text-lg font-medium">No hay planes disponibles por el momento.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {packages.map(pkg => (
              <div key={pkg.id} className="clay-card-dark rounded-3xl p-6 border-[3px] border-[#3A3A5C] text-center flex flex-col hover:-translate-y-2 transition-transform duration-300">
                <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                     style={{ background: 'rgba(255,210,63,0.1)' }}>
                  <Coins size={32} className="text-[var(--clay-yellow)]" />
                </div>
                <h3 className="text-xl font-black text-white mb-2">{pkg.name}</h3>
                <div className="mb-6 flex-1">
                  <p className="text-3xl font-black text-[var(--clay-yellow)]">{pkg.tokens}</p>
                  <p className="text-[#A8B3C8] font-semibold">Tokens</p>
                </div>
                <div className="mb-6 pb-6 border-b-[2px] border-[#3A3A5C]">
                  <span className="text-2xl font-black text-white">${pkg.priceUSD}</span>
                  <span className="text-[#A8B3C8] font-bold"> USD</span>
                </div>
                <button 
                  onClick={() => handleBuyTokens(pkg)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold bg-[#25D366] text-white hover:bg-[#128C7E] transition-colors"
                >
                  <MessageCircle size={18} /> Comprar
                </button>
              </div>
            ))}
            {packages.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-[#A8B3C8] text-lg font-medium">No hay paquetes de tokens disponibles por el momento.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
