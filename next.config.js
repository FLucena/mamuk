/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: [], // Add any external domains you need to load images from
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  env: {
    // Asegurarse de que el modo de depuración esté desactivado en producción
    NEXTAUTH_DEBUG: process.env.NODE_ENV === 'development' ? 'true' : 'false',
    // Asegurarse de que NEXTAUTH_URL esté configurado correctamente
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'https://www.mamuk.com.ar',
  },
  // Enable output standalone for Docker deployment
  output: 'standalone',
  // Optimize for HTTP/2
  compress: true,
  poweredByHeader: false,
  // Enable font optimization
  optimizeFonts: true,
  // Experimental features
  experimental: {
    // Proper handling of external packages
    serverComponentsExternalPackages: ['punycode'],
    // Enable HTTP/2 server push capabilities
    optimizeCss: true,
    // Disable tracing to avoid permission issues
    disableOptimizedLoading: true,
  },
  // Force all API routes to be dynamic
  serverRuntimeConfig: {
    dynamicRoutes: ['/api/**/*'],
  },
  // Disable telemetry using environment variable instead of config
  // telemetry: { 
  //   disabled: true 
  // },
  async headers() {
    return [
      {
        // Aplicar a todas las rutas
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          // Add a default CSP for all routes
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https:; frame-src 'self' https://www.youtube.com https://youtube.com https://player.vimeo.com https://vimeo.com https://*.firebasestorage.googleapis.com https://*.amazonaws.com https://*.cloudfront.net https://*.cloudinary.com; manifest-src 'self' https://mamuk.com.ar; object-src 'none'; base-uri 'self';",
          },
          // Remove the preload header for the font and let Next.js handle it
        ],
      },
      {
        // Configuración específica para manifest.json
        source: '/manifest.json',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type',
          },
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600',
          },
        ],
      },
      {
        // Configuración específica para sw.js
        source: '/sw.js',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Content-Type',
            value: 'application/javascript; charset=utf-8',
          },
        ],
      },
      {
        // Configuración específica para rutas de autenticación
        source: '/api/auth/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
      {
        // Add Content-Type header only for HTML pages
        source: '/((?!_next/|api/).*)',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/html; charset=utf-8',
          },
        ],
      },
      {
        // Aplicar a rutas específicas que necesitan iframes
        source: '/(workout|coach)/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https:; frame-src 'self' https://www.youtube.com https://youtube.com https://player.vimeo.com https://vimeo.com https://*.firebasestorage.googleapis.com https://*.amazonaws.com https://*.cloudfront.net https://*.cloudinary.com; manifest-src 'self' https://mamuk.com.ar; object-src 'none'; base-uri 'self';",
          },
        ],
      },
    ];
  },
}

// Disable telemetry using environment variable
process.env.NEXT_TELEMETRY_DISABLED = '1';

module.exports = nextConfig
