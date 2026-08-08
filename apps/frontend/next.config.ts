import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
let devOrigin = '';
try {
  if (apiUrl) {
    devOrigin = new URL(apiUrl).hostname;
  }
} catch (e) {
  // fallback if URL is invalid
}

const nextConfig: NextConfig = {
  output: 'standalone',
  allowedDevOrigins: devOrigin ? [devOrigin, 'localhost'] : ['localhost'],
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

export default nextConfig;
