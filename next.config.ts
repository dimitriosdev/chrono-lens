import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Disable optimization for Firebase Storage images to avoid CORS issues
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
    ],
  },
};

export default nextConfig;
