import type { NextConfig } from "next";
import { resolve } from "path";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  eslint: {
    // 构建时忽略ESLint错误
    ignoreDuringBuilds: true,
  },
  // Server external packages for Prisma
  serverExternalPackages: ["@prisma/client"],
  // Fix workspace root warning
  outputFileTracingRoot: resolve(__dirname),
};

export default nextConfig;
