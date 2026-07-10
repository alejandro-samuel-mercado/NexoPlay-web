'use client';

import PublicSidebar from './PublicSidebar';
import PublicTopBar from './PublicTopBar';
import MobileBottomNav from './MobileBottomNav';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-[var(--bg-main)]">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block w-64 flex-shrink-0 border-r border-[var(--border-subtle)]">
        <PublicSidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <PublicTopBar />
        {/* pb-20 on mobile for BottomNav, pb-12 on desktop */}
        <main className="flex-1 px-4 lg:px-8 pb-24 lg:pb-12">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
