'use client';

import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/context/ProfileContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { API, apiFetch } from '@/lib/api';

export default function ProfilesPage() {
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const { profiles, isLoading: profileLoading, setActiveProfile, refreshProfiles } = useProfile();
  const router = useRouter();
  
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [isKids, setIsKids] = useState(false);

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/login');
    }
  }, [authLoading, isLoggedIn, router]);

  const handleSelectProfile = (profile: any) => {
    setActiveProfile(profile);
    router.push('/');
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    try {
      await API.PROFILES.create({
        name: newName,
        isKids,
      });
      setIsCreating(false);
      setNewName('');
      setIsKids(false);
      await refreshProfiles();
    } catch (err: any) {
      alert(err.message || 'Error al crear perfil');
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin border-clay-teal" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-light mb-10 text-center">¿Quién está viendo?</h1>

      <div className="flex flex-wrap justify-center gap-6 max-w-4xl w-full">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            onClick={() => handleSelectProfile(profile)}
            className="group cursor-pointer flex flex-col items-center space-y-3"
          >
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-md overflow-hidden ring-4 ring-transparent group-hover:ring-white transition-all">
              <img
                src={profile.avatarUrl || '/avatars/default.png'}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-gray-400 group-hover:text-white transition-colors text-xl font-medium">
              {profile.name}
            </span>
          </div>
        ))}

        {profiles.length < 4 && !isCreating && (
          <div
            onClick={() => setIsCreating(true)}
            className="group cursor-pointer flex flex-col items-center space-y-3"
          >
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-md bg-gray-900 border-2 border-gray-700 flex items-center justify-center group-hover:border-white transition-all">
              <span className="text-5xl text-gray-500 group-hover:text-white">+</span>
            </div>
            <span className="text-gray-400 group-hover:text-white transition-colors text-xl font-medium">
              Añadir Perfil
            </span>
          </div>
        )}
      </div>

      {isCreating && (
        <div className="mt-12 w-full max-w-md bg-gray-900 p-6 rounded-lg border border-gray-800">
          <h2 className="text-2xl font-medium mb-4">Añadir Perfil</h2>
          <form onSubmit={handleCreateProfile} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Nombre"
                className="w-full bg-gray-800 border border-gray-700 p-3 rounded text-white"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                maxLength={20}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isKids"
                checked={isKids}
                onChange={(e) => setIsKids(e.target.checked)}
                className="w-5 h-5"
              />
              <label htmlFor="isKids" className="text-gray-300">¿Es un perfil infantil?</label>
            </div>
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-white text-black font-semibold py-2 rounded hover:bg-gray-200 transition"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="flex-1 border border-gray-500 text-white font-semibold py-2 rounded hover:border-white transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <button className="mt-16 border border-gray-500 text-gray-400 px-6 py-2 rounded hover:border-white hover:text-white transition">
        Administrar perfiles
      </button>
    </div>
  );
}
