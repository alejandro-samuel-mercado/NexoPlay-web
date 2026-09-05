/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permitir peticiones desde tu red local (móvil, otra PC)
  allowedDevOrigins: ['192.168.100.6', 'localhost', '127.0.0.1', '*'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'api-streamflex.unixxtech.online' },
      { protocol: 'https', hostname: 'peliculas-streamflex.unixxtech.online' },
      { protocol: 'https', hostname: 'series-streamflex.unixxtech.online' },
      { protocol: 'https', hostname: 'image.tmdb.org' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'http', hostname: '192.168.100.6' }
    ],
    qualities: [75, 100],
  },
};

module.exports = nextConfig;
