'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Heart, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { isLoggedIn } = useAuth();

  const navItems = [
    { name: 'Inicio', path: '/', icon: Home },
    { name: 'Explorar', path: '/explorar', icon: Compass },
    { name: 'Mi Lista', path: '/mi-lista', icon: Heart },
    { name: 'Perfil', path: isLoggedIn ? '/perfil' : '/auth/login', icon: User },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-panel)]/90 backdrop-blur-xl border-t border-[var(--border-subtle)] pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 w-16
                ${isActive ? 'text-[var(--btn-primary-bg)] scale-110' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}
              `}
            >
              <item.icon size={22} className={isActive ? 'drop-shadow-md' : ''} />
              <span className={`text-[10px] mt-1 font-semibold ${isActive ? 'opacity-100' : 'opacity-0 h-0'} transition-all`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
