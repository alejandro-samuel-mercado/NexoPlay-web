'use client';

import { API_BASE, apiFetch } from '@/lib/api';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';

export default function SyncButton() {
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    if (!confirm('Esto copiará el catálogo de películas/series desde Flex-Streaming a la base de datos de NexoPlay. ¿Continuar?')) return;
    setSyncing(true);
    try {
      // Usamos el endpoint de admin por defecto
      const res = await apiFetch(`${API_BASE}/api/admin/content/sync`, { method: 'POST' });
      if (res.success) {
        alert(`Sincronización completada. ${res.data?.processed || 0} elementos procesados.`);
        window.location.reload();
      } else {
        alert('Ocurrió un problema en la sincronización.');
      }
    } catch (e: any) {
      alert(e.message || 'Error al sincronizar el catálogo. (Requiere permisos de administrador)');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <button 
      onClick={handleSync}
      disabled={syncing}
      className={`btn-clay btn-clay-sm flex items-center gap-2 rounded-full p-3  ${syncing ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={{ background: 'var(--color-primary)', color: '#000' }}
    >
      <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
      {syncing ? 'Sincronizando...' : 'Sincronizar con Flex-Streaming'}
    </button>
  );
}
