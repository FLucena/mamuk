/**
 * Minimal Next.js configuration file
 * Use this if the regular configuration is causing build issues
 */

/** @type {import('next').NextConfig} */
const minimalConfig = {
  reactStrictMode: true,
  // Disable source maps in production to reduce build complexity
  productionBrowserSourceMaps: false,
  // Basic image configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/a/**',
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    formats: ['image/webp'],
    domains: [],
  },
  // Enable output standalone for Docker deployment
  output: 'standalone',
  // Basic compression
  compress: true,
  poweredByHeader: false,
  // Disable all experimental features
  experimental: {
    // No experimental features
  },
  // Minimal headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

// Disable telemetry
process.env.NEXT_TELEMETRY_DISABLED = '1';

module.exports = minimalConfig;

// Instructions:
// To use this minimal config, run:
// cp scripts/minimal-next-config.js next.config.js
// npm run build:simple 