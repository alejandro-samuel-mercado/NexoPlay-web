'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, Film, Calendar, HardDrive, BookOpen, Key } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/context/AuthContext';
import { API, apiFetch } from '@/lib/api';
import Link from 'next/link';

export default function BibliotecaPage() {
  const { user, isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'compras' | 'descargas'>('compras');
  
  const [history, setHistory] = useState<any[]>([]);
  const [library, setLibrary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/auth/login');
      return;
    }
    
    if (isLoggedIn) {
      Promise.all([
        apiFetch(API.DOWNLOADS.HISTORY).catch(() => ({ data: [] })),
        apiFetch(API.DOWNLOADS.LIBRARY).catch(() => ({ data: [] }))
      ]).then(([historyRes, libraryRes]) => {
        setHistory(historyRes.data || []);
        setLibrary(libraryRes.data || []);
      }).finally(() => setLoading(false));
    }
  }, [isLoading, isLoggedIn, router]);

  if (isLoading || loading) return (
    <>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="clay-skeleton h-12 w-64 rounded-[12px] mb-8" />
        <div className="flex gap-4 mb-8">
          <div className="clay-skeleton h-10 w-32 rounded-[12px]" />
          <div className="clay-skeleton h-10 w-32 rounded-[12px]" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="clay-skeleton h-24 rounded-[16px]" />
          ))}
        </div>
      </div>
    </>
  );

  const formatBytes = (bytes?: string | number) => {
    if (!bytes) return 'N/A';
    const num = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
    if (isNaN(num)) return 'N/A';
    const mb = num / (1024 * 1024);
    if (mb > 1024) return `${(mb / 1024).toFixed(2)} GB`;
    return `${mb.toFixed(0)} MB`;
  };

  const currentList = activeTab === 'compras' ? library : history;

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-8">
          <BookOpen size={32} style={{ color: 'var(--clay-teal)' }} />
          <h1 className="text-3xl font-black text-white">Mi Biblioteca</h1>
        </div>

        {/* TABS */}
        <div className="flex gap-2 mb-8 bg-[#1A1A2E] p-1.5 rounded-[14px] border-[2px] border-[#3A3A5C] w-fit">
          <button 
            onClick={() => setActiveTab('compras')}
            className={`px-4 py-2 rounded-[10px] text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'compras' ? 'bg-[#3A3A5C] text-white shadow-sm' : 'text-[#8B8B9B] hover:text-white'}`}>
            <Key size={16} /> Compras y Accesos
          </button>
          <button 
            onClick={() => setActiveTab('descargas')}
            className={`px-4 py-2 rounded-[10px] text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'descargas' ? 'bg-[#3A3A5C] text-white shadow-sm' : 'text-[#8B8B9B] hover:text-white'}`}>
            <Download size={16} /> Historial de Descargas
          </button>
        </div>

        {currentList.length === 0 ? (
          <div className="clay-card-dark p-12 rounded-[24px] border-[3px] border-[#3A3A5C] text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-[#1A1A2E] border-[3px] border-[#3A3A5C] flex items-center justify-center mb-6">
              {activeTab === 'compras' ? <Key size={32} className="text-[#6B7280]" /> : <Download size={32} className="text-[#6B7280]" />}
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              {activeTab === 'compras' ? 'Aún no tienes accesos' : 'Aún no hay descargas'}
            </h2>
            <p className="text-[#A8B3C8] mb-8">
              {activeTab === 'compras' 
                ? 'Las películas o series que adquieras mediante código aparecerán aquí para que las veas cuando quieras.' 
                : 'Tus descargas aparecerán aquí para que lleves el control.'}
            </p>
            <Link href="/explorar" className="btn-clay btn-clay-teal inline-flex">
              Explorar Catálogo
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {currentList.map((record) => (
              <div key={record.id} className="clay-card-dark p-4 sm:p-6 rounded-[20px] border-[2px] border-[#3A3A5C] flex flex-col sm:flex-row gap-4 sm:items-center justify-between hover:border-[var(--clay-teal)] transition-colors group">
                <div className="flex items-center gap-4">
                  {record.posterUrl ? (
                    <img src={record.posterUrl} alt="" className="w-16 h-24 object-cover rounded-[10px] border-[2px] border-[#2C2C2C]" />
                  ) : (
                    <div className="w-16 h-24 rounded-[10px] bg-[#1A1A2E] border-[2px] border-[#2C2C2C] flex items-center justify-center">
                      <Film size={24} className="text-[#3A3A5C]" />
                    </div>
                  )}
                  
                  <div>
                    <Link href={`/contenido/${record.slug}`} className="text-lg font-bold text-white hover:text-[var(--clay-teal)] transition-colors line-clamp-1">
                      {record.contentTitle || record.fileName || 'Contenido Desconocido'}
                    </Link>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <span className="clay-badge text-[10px] border-[var(--clay-teal)] text-[var(--clay-teal)]">
                        {record.contentType}
                      </span>
                      {record.quality && (
                        <span className="clay-badge text-[10px] border-[var(--clay-orange)] text-[var(--clay-orange)]">
                          {record.quality}
                        </span>
                      )}
                      {activeTab === 'compras' && (
                        <span className="clay-badge text-[10px] border-[var(--clay-yellow)] text-[var(--clay-yellow)]">
                          Acceso Desbloqueado
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-2 text-sm text-[#A8B3C8] bg-white/5 sm:bg-transparent p-3 sm:p-0 rounded-[12px] sm:rounded-none">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Calendar size={14} className="text-[#6B7280]" />
                    {new Date(record.downloadedAt || record.usedAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                  {activeTab === 'descargas' && record.fileSize && (
                    <div className="flex items-center gap-1.5 font-bold text-white">
                      <HardDrive size={14} className="text-[#6B7280]" />
                      {formatBytes(record.fileSize)}
                    </div>
                  )}
                  {activeTab === 'compras' && (
                    <Link href={`/contenido/${record.slug || record.content?.slug}`} className="text-[var(--clay-teal)] font-bold text-xs mt-2 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
                      Ver ahora →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
