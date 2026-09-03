'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Plus, Edit2, Loader2, ArrowRight } from 'lucide-react';
import { API, apiFetch } from '@/lib/api';
import { Suspense } from 'react';


function ProfileSelectionContent() {
  const { user, profiles, activeProfile, setActiveProfile, isLoggedIn, isLoading, refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams?.get('redirect') || '/';
  
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  
  // Modal states
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileAvatar, setNewProfileAvatar] = useState('/avatars/default.png');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/auth/login');
    }
  }, [isLoading, isLoggedIn]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#0A0A10] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[var(--clay-teal)] animate-spin" />
      </div>
    );
  }

  const handleProfileClick = (id: string) => {
    if (isEditing) {
      // Logic for edit mode if we want to expand it
    } else {
      setActiveProfile(id);
      router.push(redirectPath);
    }
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;
    
    setLoadingAction(true);
    setErrorMsg('');
    try {
      await API.PROFILES.create({
        name: newProfileName,
        avatarUrl: newProfileAvatar
      });
      await refreshUser();
      setShowModal(false);
      setNewProfileName('');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al crear el perfil');
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="w-full flex-1 min-h-[calc(100vh-3vh)] bg-[#0A0A10] flex flex-col items-center justify-center p-4 relative rounded-3xl" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
      {/* Branding top */}
      <div className="absolute top-8 left-8 flex items-center gap-2">
        <div className="w-9 h-9 rounded-[10px] border-[3px] border-[#2C2C2C] flex items-center justify-center text-sm font-black text-white"
          style={{ background: 'var(--clay-red)', boxShadow: '3px 3px 0px #2C2C2C' }}>
          N
        </div>
        <span className="font-black text-xl tracking-tight hidden sm:block">
         
          <span className="text-white">Vexa</span>
        </span>
      </div>

      <div className="w-full max-w-4xl flex flex-col items-center animate-fade-in-up">
        <h1 className="text-3xl md:text-5xl font-black text-white mb-12 text-center">
          ¿Quién está viendo?
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {profiles.map(profile => (
            <div key={profile.id} className="flex flex-col items-center gap-4 group">
              <button
                onClick={() => handleProfileClick(profile.id)}
                className={`relative w-28 h-28 md:w-36 md:h-36 rounded-2xl overflow-hidden transition-all duration-300
                  ${isEditing ? 'opacity-80 scale-95' : 'hover:scale-105 hover:ring-4 ring-white/50'}
                  border-2 border-transparent bg-[#1A1A2E]`}
              >
                {/* Fallback avatar generator */}
                <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-white bg-gradient-to-br from-[var(--clay-teal)] to-[var(--clay-indigo)]">
                  {profile.name?.[0]?.toUpperCase()}
                </div>
                
                {isEditing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Edit2 className="text-white" size={32} />
                  </div>
                )}
              </button>
              <span className={`text-lg font-medium transition-colors ${activeProfile?.id === profile.id ? 'text-white' : 'text-[#8B8B9B] group-hover:text-white'}`}>
                {profile.name}
              </span>
            </div>
          ))}

          {/* Add Profile Button */}
          {profiles.length < 4 && (
            <div className="flex flex-col items-center gap-4 group">
              <button
                onClick={() => setShowModal(true)}
                className="w-28 h-28 md:w-36 md:h-36 rounded-2xl border-2 border-dashed border-[#3A3A5C] flex items-center justify-center hover:border-white transition-colors group-hover:bg-white/5"
              >
                <Plus size={48} className="text-[#3A3A5C] group-hover:text-white transition-colors" />
              </button>
              <span className="text-lg font-medium text-[#8B8B9B] group-hover:text-white transition-colors">
                Agregar
              </span>
            </div>
          )}
        </div>

        <div className="mt-16">
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="px-6 py-2 border border-[#3A3A5C] text-[#8B8B9B] hover:text-white hover:border-white transition-colors text-sm font-bold uppercase tracking-wider rounded-lg"
          >
            {isEditing ? 'Listo' : 'Administrar Perfiles'}
          </button>
        </div>
      </div>

      {/* Create Profile Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121215] border border-white/10 rounded-3xl p-8 w-full max-w-md animate-fade-in-up shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Agregar Perfil</h2>
            <form onSubmit={handleCreateProfile}>
              <div className="mb-6">
                <label className="block text-sm font-bold text-[#A8B3C8] mb-2">Nombre del perfil</label>
                <input
                  type="text"
                  required
                  value={newProfileName}
                  onChange={e => setNewProfileName(e.target.value)}
                  className="w-full bg-[#1A1A2E] border-2 border-[#3A3A5C] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--clay-teal)] transition-colors"
                  placeholder="Ej. Niños, Papá"
                />
              </div>

              {errorMsg && (
                <div className="p-3 mb-6 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">
                  {errorMsg}
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-white/10 text-white rounded-xl font-bold hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="flex-1 px-4 py-3 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  {loadingAction ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfileSelectionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A10] flex items-center justify-center"><Loader2 className="w-12 h-12 text-[var(--clay-teal)] animate-spin" /></div>}>
      <ProfileSelectionContent />
    </Suspense>
  );
}
