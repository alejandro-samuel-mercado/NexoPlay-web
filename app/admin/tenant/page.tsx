'use client';

import { useEffect, useState } from 'react';
import { API } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Settings, Save, Palette, Link2 } from 'lucide-react';

export default function TenantSettingsPage() {
  const { isAdmin, isFranchisee, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    appName: '',
    primaryColor: '#00D8B6',
    logoUrl: '',
    subdomain: ''
  });

  useEffect(() => {
    if (!authLoading && !isAdmin && !isFranchisee) router.push('/');
    if (isAdmin || isFranchisee) fetchSettings();
  }, [isAdmin, isFranchisee, authLoading]);

  const fetchSettings = () => {
    setLoading(true);
    API.TENANT.getSettings().then((res) => {
      if (res.success && res.data) {
        setFormData({
          appName: res.data.appName || '',
          primaryColor: res.data.primaryColor || '#00D8B6',
          logoUrl: res.data.logoUrl || '',
          subdomain: res.data.subdomain || ''
        });
      }
    }).catch(console.error).finally(() => setLoading(false));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await API.TENANT.updateSettings(formData);
      alert('Configuración guardada exitosamente.');
    } catch (e: any) {
      alert(e.message || 'Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) return <div className="p-8 flex justify-center"><div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin border-[var(--color-primary)]" style={{ borderTopColor: 'transparent' }} /></div>;

  return (
    <div className="p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Settings className="text-[var(--color-secondary)]" size={32} />
            Configuración de Marca Blanca
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Personaliza el nombre, logo y colores de tu tienda (Franquicia)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[var(--bg-panel)] backdrop-blur-md border border-[var(--border-subtle)] p-8 rounded-2xl shadow-xl">
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-white/60 mb-2 flex items-center gap-2 uppercase tracking-wider">
                <Settings size={14} /> Nombre de la App
              </label>
              <input type="text" required value={formData.appName} onChange={e => setFormData({ ...formData, appName: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder-[var(--text-muted)]" placeholder="Ej: MiCine Play" />
            </div>
            
            <div>
              <label className="text-xs font-bold text-white/60 mb-2 flex items-center gap-2 uppercase tracking-wider">
                <Link2 size={14} /> Logo URL (Se recomienda imagen transparente .PNG)
              </label>
              <input type="url" value={formData.logoUrl} onChange={e => setFormData({ ...formData, logoUrl: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder-[var(--text-muted)]" placeholder="https://mi-servidor.com/logo.png" />
            </div>

            <div>
              <label className="text-xs font-bold text-white/60 mb-2 flex items-center gap-2 uppercase tracking-wider">
                <Palette size={14} /> Color Primario (HEX)
              </label>
              <div className="flex items-center gap-3">
                <input type="color" value={formData.primaryColor} onChange={e => setFormData({ ...formData, primaryColor: e.target.value })} className="w-12 h-12 bg-transparent border-0 rounded-lg cursor-pointer" />
                <input type="text" required value={formData.primaryColor} onChange={e => setFormData({ ...formData, primaryColor: e.target.value })} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder-[var(--text-muted)]" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-white/60 mb-2 flex items-center gap-2 uppercase tracking-wider">
                <Link2 size={14} /> Subdominio personalizado (Opcional)
              </label>
              <input type="text" value={formData.subdomain} onChange={e => setFormData({ ...formData, subdomain: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors placeholder-[var(--text-muted)]" placeholder="ej: mivideo (para mivideo.nexoplay.com)" />
            </div>

            <button type="submit" disabled={saving} className="w-full px-6 py-3.5 rounded-xl font-bold text-sm bg-[var(--color-primary)] text-black hover:scale-105 transition-transform flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:hover:scale-100">
              {saving ? <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin border-black" /> : <Save size={18} />} 
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </form>
        </div>

        {/* Vista Previa */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-white mb-2">Vista Previa</h2>
          <div className="bg-[var(--bg-panel)] backdrop-blur-md border border-[var(--border-subtle)] p-8 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl transition-all" style={{ borderTopColor: formData.primaryColor, borderTopWidth: '4px' }}>
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" style={{ background: `radial-gradient(circle at top, ${formData.primaryColor} 0%, transparent 60%)` }} />
            
            {formData.logoUrl ? (
              <img src={formData.logoUrl} alt="Logo preview" className="max-h-24 object-contain mb-6 relative z-10" />
            ) : (
              <div className="w-20 h-20 rounded-[16px] flex items-center justify-center mb-6 relative z-10" style={{ background: formData.primaryColor, color: '#12121A' }}>
                <span className="text-3xl font-black">{formData.appName?.substring(0, 1) || 'N'}</span>
              </div>
            )}
            
            <h3 className="text-2xl font-black text-white relative z-10">{formData.appName || 'NexoPlay'}</h3>
            <p className="text-[#A8B3C8] mt-2 text-sm relative z-10 max-w-xs">Bienvenido a tu plataforma de streaming personalizada.</p>
            
            <button className="mt-8 px-8 py-3 rounded-full font-bold text-[#12121A] transition-transform hover:scale-105 relative z-10" style={{ background: formData.primaryColor }}>
              Empezar a ver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
