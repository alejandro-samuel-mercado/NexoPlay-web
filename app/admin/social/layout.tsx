'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircleHeart, AlertCircle, Coins, Target, Gift, BarChart2 } from 'lucide-react';

const SOCIAL_TABS = [
  { href: '/admin/social/metricas', label: 'Métricas', icon: BarChart2 },
  { href: '/admin/social/sugerencias', label: 'Sugerencias', icon: MessageCircleHeart },
  { href: '/admin/social/moderacion', label: 'Moderación', icon: AlertCircle },
  { href: '/admin/social/tokens/reglas', label: 'Reglas de Tokens', icon: Coins },
  { href: '/admin/social/tokens/metas', label: 'Metas de Canje', icon: Target },
  { href: '/admin/social/tokens/canjes', label: 'Canjes Realizados', icon: Gift },
];

export default function SocialAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Nuba Social */}
      <div>
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <MessageCircleHeart className="text-[#E82C7C]" size={32} />
          Nuba Social
        </h1>
        <p className="text-[#8B8FA8] mt-1">
          Panel de administración para la red social y sistema de tokens.
        </p>
      </div>

      {/* Tabs / Sub-navegación */}
      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar border-b border-[var(--border-subtle)] pb-2">
        {SOCIAL_TABS.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#E82C7C]/10 text-[#E82C7C] border-b-2 border-[#E82C7C]'
                  : 'text-[#8B8FA8] hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Contenido de la página (Tabs) */}
      <div className="bg-[var(--bg-panel)] rounded-xl border border-[var(--border-subtle)] p-6 min-h-[500px]">
        {children}
      </div>
    </div>
  );
}
