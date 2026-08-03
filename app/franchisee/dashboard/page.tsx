'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { Save, Users, MonitorPlay } from 'lucide-react';

export default function FranchiseeDashboard() {
  const { user } = useAuth();
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    appName: '',
    primaryColor: '',
    logoUrl: '',
    subdomain: ''
  });

  useEffect(() => {
    if (user) loadTenant();
  }, [user]);

  const loadTenant = async () => {
    try {
      const res = await apiFetch('/api/tenants/mine');
      if (res.success && res.data) {
        setTenant(res.data);
        setFormData({
          appName: res.data.appName,
          primaryColor: res.data.primaryColor,
          logoUrl: res.data.logoUrl || '',
          subdomain: res.data.subdomain || ''
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await apiFetch('/api/tenants/mine', {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      alert('Configuración guardada correctamente.');
    } catch (e) {
      alert('Error al guardar configuración');
    }
  };

  if (!user || user.role !== 'FRANCHISEE') {
    return <div className="p-8">Acceso exclusivo para franquiciados.</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Mi Franquicia</h1>
      <p className="text-zinc-400 mb-8">Administra la apariencia de tu propia plataforma de streaming</p>

      {loading ? (
        <div>Cargando configuración...</div>
      ) : tenant ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <Users size={24} />
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Usuarios Activos</p>
                <p className="text-2xl font-bold">142</p>
              </div>
            </div>
            
            <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                <MonitorPlay size={24} />
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Reproducciones Hoy</p>
                <p className="text-2xl font-bold">856</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
            <h2 className="text-xl font-bold mb-6 border-b border-zinc-800 pb-4">Personalización (Marca Blanca)</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Nombre de la App</label>
                <input 
                  type="text" 
                  value={formData.appName}
                  onChange={e => setFormData({...formData, appName: e.target.value})}
                  className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Color Principal (HEX)</label>
                <div className="flex gap-2">
                  <div className="w-10 h-10 rounded-lg border border-zinc-700" style={{ backgroundColor: formData.primaryColor }}></div>
                  <input 
                    type="text" 
                    value={formData.primaryColor}
                    onChange={e => setFormData({...formData, primaryColor: e.target.value})}
                    className="flex-1 bg-black border border-zinc-700 rounded-lg px-4 py-2 text-white"
                  />
                </div>
              </div>

              <div className="col-span-full">
                <label className="block text-sm font-medium text-zinc-400 mb-2">URL del Logo</label>
                <input 
                  type="text" 
                  value={formData.logoUrl}
                  onChange={e => setFormData({...formData, logoUrl: e.target.value})}
                  className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-2 text-white"
                  placeholder="https://imgur.com/..."
                />
              </div>
              
              <div className="col-span-full">
                <label className="block text-sm font-medium text-zinc-400 mb-2">Subdominio</label>
                <div className="flex items-center">
                  <input 
                    type="text" 
                    value={formData.subdomain}
                    onChange={e => setFormData({...formData, subdomain: e.target.value})}
                    className="flex-1 bg-black border border-zinc-700 rounded-l-lg px-4 py-2 text-white"
                    placeholder="mitienda"
                  />
                  <div className="bg-zinc-800 border border-zinc-700 border-l-0 rounded-r-lg px-4 py-2 text-zinc-400">
                    .nexoplay.com
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-zinc-800 flex justify-end">
              <button 
                onClick={handleSave}
                className="bg-primary text-black px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90 transition"
              >
                <Save size={20} />
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-zinc-500 py-12 text-center">
          Tu cuenta aún no tiene una franquicia asignada. Contacta al soporte.
        </div>
      )}
    </div>
  );
}
