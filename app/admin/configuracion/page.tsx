'use client';

import { API, apiFetch } from '@/lib/api';
import { Globe, Info, Mail, RefreshCw, Save, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Config {
  [key: string]: string;
}

const CONFIG_FIELDS = [
  { key: 'site_name', label: 'Nombre del sitio', placeholder: 'Vexa', icon: <Globe size={16} />, type: 'text' },
  { key: 'site_description', label: 'Descripción', placeholder: 'Tu plataforma de streaming...', icon: <Info size={16} />, type: 'textarea' },
  { key: 'contact_email', label: 'Email de contacto', placeholder: 'hola@Vexa.com', icon: <Mail size={16} />, type: 'email' },
  { key: 'whatsapp_number', label: 'WhatsApp de soporte', placeholder: '+54911...', icon: <Mail size={16} />, type: 'text' },
];

export default function ConfiguracionPage() {
  const [config, setConfig] = useState<Config>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiFetch(API.ADMIN.CONFIG)
      .then(res => { if (res.success) setConfig(res.data || {}); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiFetch(API.ADMIN.CONFIG, {
        method: 'POST',
        body: JSON.stringify(config),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="clay-skeleton h-16 rounded-[16px]" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 w-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Settings size={28} style={{ color: 'var(--clay-mint)' }} />
            Configuración
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Ajustes generales del sistema Vexa</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all disabled:opacity-60"
          style={{
            background: saved ? 'var(--clay-mint)' : 'var(--clay-teal)',
            color: 'var(--clay-ink)',
            border: '2px solid var(--clay-ink)',
            boxShadow: '3px 3px 0 var(--clay-ink)',
          }}>
          {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
          {saved ? '¡Guardado!' : saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CONFIG_FIELDS.map(field => (
          <div key={field.key}
            className="p-5 rounded-2xl border-2"
            style={{ background: 'var(--bg-panel)', borderColor: 'rgba(255,255,255,0.08)' }}>
            <label className="flex items-center gap-2 text-sm font-bold text-white mb-3">
              <span style={{ color: 'var(--clay-teal)' }}>{field.icon}</span>
              {field.label}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                value={config[field.key] || ''}
                onChange={e => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                rows={3}
                className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none resize-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)', color: 'var(--text-main)' }}
              />
            ) : (
              <input
                type={field.type}
                value={config[field.key] || ''}
                onChange={e => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)', color: 'var(--text-main)' }}
              />
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-2xl border-2" style={{ borderColor: 'rgba(255,210,63,0.3)', background: 'rgba(255,210,63,0.06)' }}>
        <p className="text-xs font-bold" style={{ color: 'var(--clay-yellow)' }}>⚠️ Nota</p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          Los cambios de configuración se aplican inmediatamente en toda la plataforma. El número de WhatsApp se utilizará para que los usuarios puedan contactar soporte directamente desde la web.
        </p>
      </div>
    </div>
  );
}
