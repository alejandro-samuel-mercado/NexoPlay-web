import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { headers } from 'next/headers';
import { API_BASE } from '@/lib/api';

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

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : "0, 216, 182";
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const domain = headersList.get('x-tenant-domain');
  
  let tenant = null;
  if (domain && domain !== 'localhost' && !domain.includes('nexoplay.com')) {
    try {
      const res = await fetch(`${API_BASE}/api/tenants/resolve?domain=${domain}`, { next: { revalidate: 60 } });
      const json = await res.json();
      if (json.success && json.data) tenant = json.data;
    } catch (e) {
      console.error("Failed to fetch tenant", e);
    }
  }

  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
        {tenant && tenant.primaryColor && (
          <style dangerouslySetInnerHTML={{
            __html: `
              :root {
                --color-primary: ${tenant.primaryColor};
                --color-primary-rgb: ${hexToRgb(tenant.primaryColor)};
              }
            `
          }} />
        )}
      </head>
      <body className="antialiased">
        <AuthProvider>
            {children}
        </AuthProvider>
      </body>
    </html>
  );
}
