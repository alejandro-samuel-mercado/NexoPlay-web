'use client';

import { Search, Bell, ChevronDown, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { CONTENT_TYPES_LIST, getContentTypeLabel, getContentTypeIcon } from '@/lib/content-types';
import CustomSelect from '@/components/ui/CustomSelect';

export default function PublicTopBar() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const currentSearch = searchParams.get('search') || '';
  const [inputValue, setInputValue] = useState('');
  const [theme, setTheme] = useState('dark');
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const lastUpdatedUrlSearch = useRef(currentSearch);

  const inputRef = useRef<HTMLInputElement>(null);

  // Load theme on mount
  useEffect(() => {
    const stored = localStorage.getItem('serivia-theme') || 'dark';
    setTheme(stored);
    document.documentElement.setAttribute('data-theme', stored);
  }, []);

  // Sync search input with URL param, but ONLY if the URL changed externally
  // (not from our own typing)
  useEffect(() => {
      if (pathname === '/explorar') {
          const pendingVal = sessionStorage.getItem('pending-search-val');
          if (pendingVal !== null) {
              // Restore keystrokes that happened while navigating
              setInputValue(pendingVal);
              lastUpdatedUrlSearch.current = pendingVal;
              sessionStorage.removeItem('pending-search-val');
              
              // Ensure the URL catches up to the restored keystrokes
              const params = new URLSearchParams(searchParams.toString());
              if (pendingVal.trim()) {
                  params.set('search', pendingVal);
              } else {
                  params.delete('search');
              }
              router.replace(`/explorar?${params.toString()}`);
          } else if (currentSearch !== lastUpdatedUrlSearch.current) {
              setInputValue(currentSearch);
              lastUpdatedUrlSearch.current = currentSearch;
          }
      } else {
          setInputValue('');
          lastUpdatedUrlSearch.current = '';
          sessionStorage.removeItem('pending-search-val');
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, currentSearch]);

  // Restore focus if coming from another page's auto-navigate
  useEffect(() => {
      if (typeof window !== 'undefined' && sessionStorage.getItem('focus-search') === 'true') {
          sessionStorage.removeItem('focus-search');
          if (inputRef.current) {
              inputRef.current.focus();
              const len = inputRef.current.value.length;
              inputRef.current.setSelectionRange(len, len);
          }
      }
  }, [pathname]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('serivia-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val); // Update immediately for UI
    sessionStorage.setItem('pending-search-val', val); // Save keystrokes instantly!
    
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    
    debounceTimer.current = setTimeout(() => {
        if (pathname === '/explorar') {
            const params = new URLSearchParams(searchParams.toString());
            if (val.trim()) {
                params.set('search', val);
            } else {
                params.delete('search');
            }
            lastUpdatedUrlSearch.current = val; // Mark that WE caused this URL change
            router.replace(`/explorar?${params.toString()}`);
        } else {
            if (val.trim()) {
                sessionStorage.setItem('focus-search', 'true');
                lastUpdatedUrlSearch.current = val;
                router.push(`/explorar?search=${encodeURIComponent(val)}`);
            }
        }
    }, 200); // 200ms debounce
  };

  const handleSearchSubmit = () => {
      if (pathname !== '/explorar') {
          if (inputValue.trim()) {
              router.push(`/explorar?search=${encodeURIComponent(inputValue)}`);
          } else {
              router.push('/explorar');
          }
      }
  };

  return (
    <header className="topbar-wrapper">
      {/* Left side: Category Dropdown */}
      {pathname !== '/explorar' && (
        <div className="flex items-center gap-6 shrink-0 relative z-50">
          <div className="w-48">
              <CustomSelect 
                  options={[
                      { id: '/explorar', name: 'Explorar Todo', icon: <Search size={16} /> },
                      ...CONTENT_TYPES_LIST.map(t => ({
                          id: `/explorar?type=${t}`,
                          name: getContentTypeLabel(t),
                          icon: getContentTypeIcon(t, 16)
                      }))
                  ]}
                  value="/explorar"
                  onChange={(val) => val && router.push(val)}
                  placeholder="Explorar Todo"
              />
          </div>
        </div>
      )}

      {/* Center: Search */}
      <div className="topbar-search hidden md:block w-full max-w-xl mx-8">
        <div className="relative">
            <button 
                onClick={handleSearchSubmit}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-[var(--text-main)] transition z-10"
                title="Buscar"
            >
                <Search size={18} />
            </button>
            <input 
                ref={inputRef}
                type="text" 
                placeholder="Películas, series, shows..." 
                value={inputValue}
                onChange={handleSearchChange}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSearchSubmit();
                }}
                className="w-full bg-[var(--bg-panel)] border border-[var(--border-subtle)] rounded-full py-3.5 pl-12 pr-6 text-sm text-[var(--text-main)] placeholder-gray-500 focus:outline-none focus:border-[var(--border-strong)] transition-all shadow-inner"
            />
        </div>
      </div>

      {/* Right side: Theme & Profile */}
      <div className="flex items-center gap-5">
        <button 
            onClick={toggleTheme}
            className="relative w-10 h-10 rounded-xl bg-[var(--bg-panel)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition shadow-inner"
            title="Cambiar tema"
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {user ? (
          <div className="flex items-center gap-3 cursor-pointer group bg-[var(--bg-panel)] pl-2 pr-4 py-1.5 rounded-full border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-all shadow-inner">
            <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Yuki" 
                alt="Profile" 
                className="w-9 h-9 rounded-full border border-[var(--border-strong)]"
            />
            <div className="hidden sm:flex flex-col justify-center">
              <span className="text-sm font-bold text-[var(--text-main)] group-hover:text-[var(--color-primary)] transition-colors leading-tight">{user.name || 'Usuario'}</span>
              <span className="text-[10px] text-[var(--color-primary)] font-black uppercase tracking-wider leading-tight mt-0.5">Premium</span>
            </div>
            <ChevronDown size={16} className="text-[var(--text-muted)] hidden sm:block ml-1" />
          </div>
        ) : (
          <Link href="/auth/login" className="bg-[var(--color-primary)] text-black px-5 py-2 rounded-full font-bold text-sm hover:brightness-110 transition">
            Iniciar Sesión
          </Link>
        )}
      </div>
    </header>
  );
}
