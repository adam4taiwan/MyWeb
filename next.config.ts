// next.config.js
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 新增這行：啟用 Standalone 模式，優化 Docker 映像
  output: "standalone", 
  
  images: {
    unoptimized: true,
  },
  typescript: {
    // ignoreBuildErrors: true,
  },
  // env: {
  //   // 您的後端 API 地址
  //   NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL, 
  // },
};

export default nextConfig;