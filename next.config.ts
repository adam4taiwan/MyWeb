// next.config.js
import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  output: "standalone",

  images: {
    unoptimized: true,
  },

  // Override Vary header for ig-card routes so Instagram CDN won't reject the response
  async headers() {
    return [
      {
        source: '/api/ig-card/:path*',
        headers: [
          { key: 'Vary', value: 'Accept-Encoding' },
        ],
      },
    ];
  },

  // Dev proxy: browser calls /ecan-api/... -> Next.js server -> localhost:5013/api/...
  // Avoids WSL2 network isolation issue where browser can't reach WSL2 localhost:5013
  async rewrites() {
    if (!isDev) return [];
    return [
      {
        source: '/ecan-api/:path*',
        destination: 'http://localhost:5013/api/:path*',
      },
    ];
  },
};

export default withNextIntl(nextConfig);
