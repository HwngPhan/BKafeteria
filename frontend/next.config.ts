import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  serverExternalPackages: ['@aws-sdk/client-s3'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-92f23d47ab254e928ba4a52636074446.r2.dev',
        port: '',
      }
    ],
  }
};

export default nextConfig;
