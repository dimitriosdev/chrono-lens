import type { NextConfig } from "next";
import { execSync } from "child_process";
import packageJson from "./package.json";

// Get git commit hash for development
const getGitCommitHash = () => {
  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
};

const nextConfig: NextConfig = {
  // Static export to eliminate Cloud Run/Artifact Registry costs
  output: "export",
  trailingSlash: true,
  env: {
    // Always include the version from package.json
    NEXT_PUBLIC_VERSION: packageJson.version,
    // Only set these in development - production will use GitHub Actions
    ...(process.env.NODE_ENV === "development" && {
      NEXT_PUBLIC_BUILD_TIME: new Date().toISOString(),
      NEXT_PUBLIC_COMMIT_HASH: getGitCommitHash(),
      NEXT_PUBLIC_DEPLOY_TIME: new Date().toISOString(),
    }),
  },
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
