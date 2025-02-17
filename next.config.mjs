/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'drive.google.com'
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com'
      }
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://accounts.google.com https://drive.google.com;"
          }
        ],
      }
    ];
  },
  experimental: {
    // Suppress punycode warning
    serverComponentsExternalPackages: ['punycode'],
  },
};

export default nextConfig; 