'use client';

import { Search, Bell, ChevronDown, SlidersHorizontal, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API, apiFetch } from '@/lib/api';

export default function PublicTopBar() {
  const [theme, setTheme] = useState('dark');
  const { user, isLoggedIn } = useAuth();
  const [genres, setGenres] = useState<any[]>([]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Fetch genres for the dropdown
    apiFetch(API.CONTENT.GENRES)
      .then(res => {
        if (res.success && res.data) {
          setGenres(res.data);
        }
      })
      .catch(() => {
        // Fallback to mock data
        setGenres([
          { id: '1', name: 'Movies' },
          { id: '2', name: 'Series' },
          { id: '3', name: 'Anime' }
        ]);
      });
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const displayName = isLoggedIn && user ? user.name || 'Usuario' : 'Guest User';
  const displayPlan = isLoggedIn && user ? ((user as any).subscription?.plan?.name || 'Gratis') : 'Explorador';
  const displayAvatar = isLoggedIn && user 
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`
    : 'https://i.pravatar.cc/150?u=a042581f4e29026704d';

  return (
    <header className="sticky top-0 z-40 bg-[var(--bg-main)]/80 backdrop-blur-xl border-b border-transparent py-3 lg:py-4 px-4 lg:px-8 flex items-center justify-between gap-2 lg:gap-4">
      {/* Left side: Category Dropdown */}
      <div className="relative group shrink-0">
        <button className="flex items-center gap-2 lg:gap-3 bg-[var(--bg-panel)] hover:bg-[var(--bg-hover)] transition-colors border border-[var(--border-subtle)] rounded-full px-3 lg:px-5 py-2 lg:py-2.5 text-sm font-semibold text-[var(--text-main)]">
          <span className="hidden sm:inline">{genres.length > 0 ? genres[0].name : 'Explorar'}</span>
          <span className="sm:hidden text-xs">Cat</span>
          <ChevronDown size={16} className="text-[var(--text-muted)] group-hover:rotate-180 transition-transform" />
        </button>
        <div className="absolute top-full mt-2 w-48 bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
          {genres.map(g => (
            <Link key={g.id} href={`/explorar?genreId=${g.id}`} className="block px-4 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] first:rounded-t-2xl last:rounded-b-2xl">
              {g.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-xl mx-1 lg:mx-8">
        <div className="search-bar-oval flex items-center px-3 lg:px-4 py-2 lg:py-2.5 w-full">
          <Search size={18} className="text-[var(--text-muted)] mr-2 lg:mr-3 shrink-0" />
          <input 
            type="text" 
            placeholder="Buscar..." 
            className="search-input text-sm lg:text-base min-w-0"
          />
          <button className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors ml-2 lg:ml-3 hidden sm:block shrink-0">
            <SlidersHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Right side: Notifications & Profile */}
      <div className="flex items-center gap-2 lg:gap-4 shrink-0">
        <button onClick={toggleTheme} className="btn-icon-rounded w-8 h-8 lg:w-10 lg:h-10">
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <button className="btn-icon-rounded relative w-8 h-8 lg:w-10 lg:h-10 hidden sm:flex">
          <Bell size={16} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-[var(--bg-main)]"></span>
        </button>

        <Link href={isLoggedIn ? "/perfil" : "/auth/login"} className="flex items-center gap-2 lg:gap-3 bg-[var(--bg-panel)] hover:bg-[var(--bg-hover)] transition-colors border border-[var(--border-subtle)] rounded-full p-1 lg:p-1.5 lg:pr-4 cursor-pointer">
          <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full overflow-hidden">
            <img src={displayAvatar} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div className="hidden lg:flex flex-col">
            <span className="text-xs font-bold text-[var(--text-main)] leading-tight">{displayName}</span>
            <span className="text-[10px] text-[#FFD700] font-semibold">{displayPlan}</span>
          </div>
          <ChevronDown size={14} className="text-[var(--text-muted)] hidden lg:block ml-2" />
        </Link>
      </div>
    </header>
  );
}
