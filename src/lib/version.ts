/**
 * Version configuration for the application
 * This file is automatically updated during build/deployment
 */

export const APP_VERSION = {
  // Semantic version
  version: "1.0.0",

  // Build timestamp (will be set during build)
  buildTime: process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toISOString(),

  // Git commit hash (will be set during build)
  commitHash: process.env.NEXT_PUBLIC_COMMIT_HASH || "unknown",

  // Environment
  environment: process.env.NODE_ENV || "development",

  // Deployment timestamp
  deployTime: process.env.NEXT_PUBLIC_DEPLOY_TIME || new Date().toISOString(),
} as const;

// Helper function to format version info
export const getVersionInfo = () => {
  return {
    ...APP_VERSION,
    fullVersion: `${APP_VERSION.version}+${APP_VERSION.commitHash.substring(
      0,
      7
    )}`,
    buildDate: new Date(APP_VERSION.buildTime).toLocaleDateString(),
    deployDate: new Date(APP_VERSION.deployTime).toLocaleDateString(),
  };
};

// Helper function for debugging
export const logVersionInfo = () => {
  if (typeof window !== "undefined") {
    console.group("🚀 App Version Info");
    console.log("Version:", APP_VERSION.version);
    console.log("Build Time:", APP_VERSION.buildTime);
    console.log("Commit Hash:", APP_VERSION.commitHash);
    console.log("Environment:", APP_VERSION.environment);
    console.log("Deploy Time:", APP_VERSION.deployTime);
    console.groupEnd();
  }
};
