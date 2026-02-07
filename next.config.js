const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'unsplash-images',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 jours
        },
      },
    },
    {
      urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-images',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 jours
        },
      },
    },
    {
      urlPattern: /^https:\/\/.*\.(?:js|css|woff|woff2|ttf|otf)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-resources',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 jours
        },
      },
    },
  ],
});

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

module.exports = withPWA(nextConfig)


