/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permitir peticiones desde tu red local (móvil, otra PC)
  allowedDevOrigins: ['192.168.100.6', 'localhost', '127.0.0.1', '*'],
};

module.exports = nextConfig;
