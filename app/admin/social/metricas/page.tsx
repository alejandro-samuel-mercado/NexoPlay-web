'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API, apiFetch } from '@/lib/api';

import { Users, FileText, MessageCircle, Coins, TrendingUp, Gift } from 'lucide-react';

type Metrics = {
  totalPosts: number;
  totalComments: number;
  totalSuggestions: number;
  tokensCirculating: number;
  tokensSpent: number;
  topUsers: Array<{
    userId: string;
    total: number;
    user: { name: string; email: string };
  }>;
};

export default function SocialMetricsPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const res = await apiFetch(API.SOCIAL_ADMIN.METRICS);
      setMetrics(res.data);
    } catch (error) {
      console.error('Error fetching metrics', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-4 border-[#E82C7C] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white mb-4">Métricas de la Comunidad</h2>
      
      {/* Cards de Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1E1E3A] border border-[var(--border-subtle)] p-5 rounded-xl">
          <div className="flex items-center gap-3 text-[#8B8FA8] mb-2">
            <FileText size={18} />
            <span className="font-semibold text-sm">Posts Publicados</span>
          </div>
          <p className="text-3xl font-black text-white">{metrics?.totalPosts || 0}</p>
        </div>
        
        <div className="bg-[#1E1E3A] border border-[var(--border-subtle)] p-5 rounded-xl">
          <div className="flex items-center gap-3 text-[#8B8FA8] mb-2">
            <MessageCircle size={18} />
            <span className="font-semibold text-sm">Comentarios</span>
          </div>
          <p className="text-3xl font-black text-white">{metrics?.totalComments || 0}</p>
        </div>

        <div className="bg-[#1E1E3A] border border-[var(--border-subtle)] p-5 rounded-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <Coins size={64} className="text-[#E82C7C]" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 text-[#8B8FA8] mb-2">
              <Coins size={18} className="text-[#E82C7C]" />
              <span className="font-semibold text-sm">Tokens en Circulación</span>
            </div>
            <p className="text-3xl font-black text-white">{metrics?.tokensCirculating || 0}</p>
          </div>
        </div>

        <div className="bg-[#1E1E3A] border border-[var(--border-subtle)] p-5 rounded-xl">
          <div className="flex items-center gap-3 text-[#8B8FA8] mb-2">
            <Gift size={18} className="text-green-400" />
            <span className="font-semibold text-sm">Tokens Gastados (Canjes)</span>
          </div>
          <p className="text-3xl font-black text-white">{metrics?.tokensSpent || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Top Usuarios por Actividad de Tokens */}
        <div className="bg-[#1E1E3A] border border-[var(--border-subtle)] p-5 rounded-xl">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--border-subtle)]">
            <TrendingUp size={20} className="text-[#E82C7C]" />
            <h3 className="font-bold text-white">Top 5 Usuarios Más Activos</h3>
          </div>
          
          {metrics?.topUsers && metrics.topUsers.length > 0 ? (
            <div className="space-y-3">
              {metrics.topUsers.map((u, i) => (
                <div key={u.userId} className="flex items-center justify-between bg-white/5 p-3 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#E82C7C]/20 flex items-center justify-center text-[#E82C7C] font-bold text-xs">
                      #{i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{u.user.name || 'Usuario'}</p>
                      <p className="text-xs text-[#8B8FA8]">{u.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-[#E82C7C]/20 px-2 py-1 rounded-md border border-[#E82C7C]/30">
                    <Coins size={12} className="text-[#E82C7C]" />
                    <span className="text-xs font-bold text-[#E82C7C]">{u.total} Ganados</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-[#8B8FA8] py-8 text-sm">No hay datos suficientes</p>
          )}
        </div>
        
        {/* Resumen de Sugerencias */}
        <div className="bg-[#1E1E3A] border border-[var(--border-subtle)] p-5 rounded-xl">
          <h3 className="font-bold text-white mb-4 pb-3 border-b border-[var(--border-subtle)]">Sugerencias de Contenido</h3>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <p className="text-5xl font-black text-white mb-2">{metrics?.totalSuggestions || 0}</p>
              <p className="text-sm text-[#8B8FA8]">Sugerencias en total</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
