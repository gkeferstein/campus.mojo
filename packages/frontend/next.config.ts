import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "campus.mojo-institut.de",
      },
      {
        protocol: "https",
        hostname: "dev.campus.mojo-institut.de",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_DIRECTUS_URL: process.env.NEXT_PUBLIC_DIRECTUS_URL,
  },
  webpack: (config) => {
    // Ensure only one instance of next-themes is used
    // This fixes the issue where the design system has its own copy
    config.resolve.alias = {
      ...config.resolve.alias,
      'next-themes': path.resolve('./node_modules/next-themes'),
    };
    return config;
  },
};

export default nextConfig;






