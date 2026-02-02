/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'my.matterport.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'sketchfab.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Permettre les images locales non optimisées pour les uploads
    unoptimized: false,
    // Domaine local pour les images uploadées
    domains: ['localhost'],
  },
  // Optimisations pour la production
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
}

module.exports = nextConfig


