'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ResellerLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--clay-teal)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!user || (user.role !== 'RESELLER' && user.role !== 'ADMIN')) {
    router.push('/');
    return null;
  }

  return <>{children}</>;
}
