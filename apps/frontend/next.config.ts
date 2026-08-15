import type { NextConfig } from "next";
import * as dotenv from "dotenv";
import * as path from "path";

// Load root .env
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Dynamically expose variables to client bundle
process.env.NEXT_PUBLIC_LINE_CLIENT_ID = process.env.LINE_CLIENT_ID || "";
process.env.NEXT_PUBLIC_LINE_CALLBACK_URL = process.env.LINE_CALLBACK_URL || "";
process.env.NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
process.env.NEXT_PUBLIC_SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";

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
