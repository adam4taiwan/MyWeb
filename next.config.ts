// next.config.js
import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  output: "standalone",

  images: {
    unoptimized: true,
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

export default nextConfig;