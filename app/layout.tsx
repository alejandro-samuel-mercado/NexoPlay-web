import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ProfileProvider } from '@/context/ProfileContext';

export const metadata: Metadata = {
  title: { default: 'NexoPlay — Descargá tu contenido favorito', template: '%s | NexoPlay' },
  description: 'Explorá, compará y descargá series, películas, animes, documentales y más. Con NexoPlay, el entretenimiento es tuyo.',
  keywords: ['descargar películas', 'series online', 'anime', 'descargas', 'streaming'],
  openGraph: {
    title: 'NexoPlay',
    description: 'Explorá y descargá tu contenido favorito',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <ProfileProvider>
            {children}
          </ProfileProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
