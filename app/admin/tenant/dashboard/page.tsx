'use client';

import { useEffect, useState } from 'react';
import { API } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Users, DollarSign, Activity, Settings } from 'lucide-react';
import Link from 'next/link';

export default function TenantDashboardPage() {
  const { isAdmin, isFranchisee, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdmin && !isFranchisee) router.push('/');
    if (isAdmin || isFranchisee) fetchDashboard();
  }, [isAdmin, isFranchisee, authLoading]);

  const fetchDashboard = () => {
    setLoading(true);
    API.TENANT.getDashboard().then((res) => {
      if (res.success && res.data) {
        setData(res.data);
      }
    }).catch(console.error).finally(() => setLoading(false));
  };

  if (authLoading || loading) return <div className="p-8"><div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin border-[var(--clay-teal)]" /></div>;

  return (
    <div className="p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Activity className="text-[var(--clay-teal)]" size={32} />
            Dashboard de {data?.tenant?.appName || 'Franquicia'}
          </h1>
          <p className="text-sm text-[#6B7280] mt-1">Resumen de tu tienda personalizada</p>
        </div>
        <Link href="/admin/tenant" className="btn-clay flex items-center gap-2">
          <Settings size={16} /> Configurar Tienda
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="clay-card-dark p-6 rounded-[20px] border-2 border-[var(--clay-primary)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--clay-primary)]/20 flex items-center justify-center">
            <Users className="text-[var(--clay-primary)]" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-bold mb-1">Total Usuarios</p>
            <p className="text-3xl font-black text-white">{data?.stats?.totalUsers || 0}</p>
          </div>
        </div>
        
        <div className="clay-card-dark p-6 rounded-[20px] border-2 border-[var(--clay-mint)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--clay-mint)]/20 flex items-center justify-center">
            <Activity className="text-[var(--clay-mint)]" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-bold mb-1">Suscripciones Activas</p>
            <p className="text-3xl font-black text-white">{data?.stats?.activeSubscriptions || 0}</p>
          </div>
        </div>

        <div className="clay-card-dark p-6 rounded-[20px] border-2 border-[var(--clay-yellow)] flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--clay-yellow)]/20 flex items-center justify-center">
            <DollarSign className="text-[var(--clay-yellow)]" size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-400 font-bold mb-1">Ingresos Estimados (Mensual)</p>
            <p className="text-3xl font-black text-white">${data?.stats?.monthlyRevenue || 0}</p>
          </div>
        </div>
      </div>

      <div className="clay-card-dark p-6 rounded-[20px] border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Últimos Registros</h2>
        {data?.stats?.recentSignups?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="p-3 text-xs text-gray-400 font-bold uppercase tracking-wider">Email</th>
                  <th className="p-3 text-xs text-gray-400 font-bold uppercase tracking-wider">Plan</th>
                  <th className="p-3 text-xs text-gray-400 font-bold uppercase tracking-wider">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {data.stats.recentSignups.map((u: any, i: number) => (
                  <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                    <td className="p-3 text-sm text-white font-semibold">{u.email}</td>
                    <td className="p-3 text-sm text-white">
                      <span className="bg-gray-800 px-2 py-1 rounded text-xs border border-gray-700">{u.plan}</span>
                    </td>
                    <td className="p-3 text-sm text-gray-400">{new Date(u.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">No hay registros recientes.</p>
        )}
      </div>
    </div>
  );
}
