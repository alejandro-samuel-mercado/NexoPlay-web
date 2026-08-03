'use client';

import { useState, useEffect } from 'react';
import { API, apiFetch } from '@/lib/api';

import { Trash2, AlertTriangle, MessageCircle, Heart, Search } from 'lucide-react';


type Post = {
  id: string;
  body: string;
  type: string;
  tmdbTitle: string | null;
  createdAt: string;
  user: { name: string; email: string };
  _count: { comments: number; reactions: number };
};

export default function SocialModerationPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await apiFetch(API.SOCIAL_ADMIN.MODERATION_POSTS);
      setPosts(res.data);
    } catch (error) {
      alert('Error al cargar posts para moderación');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que querés eliminar este post? Esta acción no se puede deshacer y eliminará también sus comentarios.')) {
      return;
    }

    setDeletingId(id);
    try {
      await apiFetch(API.SOCIAL_ADMIN.MODERATION_DELETE_POST(id), {
        method: 'DELETE',
      });
      alert('Post eliminado correctamente');
      setPosts(posts.filter(p => p.id !== id));
    } catch (error) {
      alert('Error al eliminar post');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = posts.filter(p => 
    p.body.toLowerCase().includes(search.toLowerCase()) || 
    p.user.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.user.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Moderación de Posts</h2>
          <p className="text-sm text-[#8B8FA8]">Revisá los últimos posts publicados en la comunidad y eliminá contenido inapropiado.</p>
        </div>
        
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B8FA8]" />
          <input
            type="text"
            placeholder="Buscar por texto o usuario..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#1E1E3A] border border-[var(--border-subtle)] rounded-lg pl-10 pr-4 py-2 text-white text-sm focus:outline-none focus:border-[#E82C7C] w-full md:w-64"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 rounded-full border-4 border-[#E82C7C] border-t-transparent animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-[#1E1E3A] border border-[var(--border-subtle)] rounded-xl flex flex-col items-center">
          <AlertTriangle size={48} className="text-[#8B8FA8] mb-4 opacity-50" />
          <p className="text-[#8B8FA8]">No se encontraron posts con ese criterio.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map(p => (
            <div key={p.id} className="bg-[#1E1E3A] border border-[var(--border-subtle)] rounded-xl p-5 flex flex-col md:flex-row gap-5">
              
              {/* Contenido del post */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-white text-xs">
                    {(p.user.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white leading-none">{p.user.name || 'Usuario'}</p>
                    <p className="text-xs text-[#8B8FA8] mt-1">{p.user.email}</p>
                  </div>
                  <span className="ml-auto text-xs text-[#8B8FA8]">
                    {new Date(p.createdAt).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })}
                  </span>
                </div>
                
                <p className="text-white text-sm leading-relaxed mb-4">{p.body}</p>
                
                <div className="flex items-center gap-4 border-t border-[var(--border-subtle)] pt-3">
                  <div className="flex items-center gap-1.5 text-[#8B8FA8]">
                    <Heart size={14} />
                    <span className="text-xs font-bold">{p._count.reactions}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#8B8FA8]">
                    <MessageCircle size={14} />
                    <span className="text-xs font-bold">{p._count.comments}</span>
                  </div>
                  
                  {p.tmdbTitle && (
                    <div className="ml-auto bg-[#E82C7C]/10 border border-[#E82C7C]/20 px-2 py-1 rounded text-[#E82C7C] text-[10px] font-bold uppercase tracking-wider">
                      Vinculado a: {p.tmdbTitle}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Acciones de Moderación */}
              <div className="md:border-l border-[var(--border-subtle)] md:pl-5 flex md:flex-col items-center md:items-end justify-center md:justify-start pt-4 md:pt-0 border-t md:border-t-0 mt-4 md:mt-0 gap-3">
                <button
                  onClick={() => handleDelete(p.id)}
                  disabled={deletingId === p.id}
                  className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-lg text-sm font-bold transition-all w-full md:w-auto disabled:opacity-50"
                >
                  <Trash2 size={16} />
                  Eliminar Post
                </button>
              </div>
              
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
