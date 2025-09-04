/**
 * Development component for debugging user identity issues and showing version info
 * Only shown in development mode
 */
"use client";

import React, { useState, useEffect } from "react";
import {
  debugUserIdentity,
  checkForMigratableData,
  migrateFromAnonymousUser,
} from "@/utils/userMigration";
import { getVersionInfo } from "@/lib/version";

interface UserDebugInfo {
  currentUserId: string;
  isFirebaseAuth: boolean;
  localStorageUserId: string | null;
  isSignedIn: boolean;
}

export function UserDebugPanel() {
  const [debugInfo, setDebugInfo] = useState<UserDebugInfo | null>(null);
  const [migratableUserIds, setMigratableUserIds] = useState<string[]>([]);
  const [migrationStatus, setMigrationStatus] = useState<string>("");
  const [isVisible, setIsVisible] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"debug" | "version">("debug");

  const versionInfo = getVersionInfo();

  // Only show in development or for authorized users
  useEffect(() => {
    const isDevelopment = process.env.NODE_ENV === "development";
    const isAuthorizedForDebug = checkDebugAuthorization();

    if (isDevelopment || isAuthorizedForDebug) {
      setIsVisible(true);
      loadDebugInfo();
    }
  }, []);

  // Function to check if user is authorized for debug access
  const checkDebugAuthorization = (): boolean => {
    // Only enable in production with specific conditions
    if (process.env.NODE_ENV === "production") {
      // Option 1: Check for admin role (requires user auth system)
      // const { user } = useAuth();
      // return user?.role === 'admin' || user?.email?.endsWith('@yourcompany.com');

      // Option 2: Check for debug query parameter + secret key
      const urlParams = new URLSearchParams(window.location.search);
      const debugParam = urlParams.get("debug");
      const secretKey = process.env.NEXT_PUBLIC_DEBUG_SECRET; // Set this in your environment
      return debugParam === secretKey && secretKey !== undefined;
    }

    return false;
  };

  // Add keyboard shortcut to toggle debug panel
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      // Ctrl+Shift+D to toggle debug panel
      if (event.ctrlKey && event.shiftKey && event.key === "D") {
        event.preventDefault();
        setIsPanelOpen((prev) => !prev);
      }
    };

    if (isVisible) {
      document.addEventListener("keydown", handleKeydown);
      return () => document.removeEventListener("keydown", handleKeydown);
    }
  }, [isVisible]);

  const loadDebugInfo = async () => {
    try {
      const info = await debugUserIdentity();
      setDebugInfo(info);

      const migratableIds = await checkForMigratableData();
      setMigratableUserIds(migratableIds);
    } catch (error) {
      console.error("Failed to load debug info:", error);
    }
  };

  const handleMigration = async (anonymousUserId: string) => {
    setMigrationStatus(`Migrating from ${anonymousUserId}...`);

    try {
      const result = await migrateFromAnonymousUser(anonymousUserId);

      if (result.success) {
        setMigrationStatus(
          `✅ Migrated ${result.migratedAlbums} albums successfully!`
        );
        // Reload debug info
        await loadDebugInfo();
      } else {
        setMigrationStatus(`❌ Migration failed: ${result.errors.join(", ")}`);
      }
    } catch (error) {
      setMigrationStatus(`❌ Migration error: ${error}`);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle button - always visible when component is available */}
      <button
        onClick={() => setIsPanelOpen((prev) => !prev)}
        className="bg-yellow-600 hover:bg-yellow-700 text-white p-2 rounded-lg shadow-lg mb-2 text-xs font-semibold"
        title="Toggle Debug Panel (Ctrl+Shift+D)"
      >
        🔧 Debug
      </button>

      {/* Debug panel - only visible when toggled open */}
      {isPanelOpen && (
        <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-md">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-yellow-400">
              🔧 Dev Panel
            </h3>
            <button
              onClick={() => setIsPanelOpen(false)}
              className="text-gray-400 hover:text-white text-lg"
              title="Close Debug Panel"
            >
              ×
            </button>
          </div>

          {/* Tab navigation */}
          <div className="flex mb-4 bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("debug")}
              className={`flex-1 px-3 py-2 text-xs rounded-md transition-colors ${
                activeTab === "debug"
                  ? "bg-yellow-600 text-white"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              🔧 Debug
            </button>
            <button
              onClick={() => setActiveTab("version")}
              className={`flex-1 px-3 py-2 text-xs rounded-md transition-colors ${
                activeTab === "version"
                  ? "bg-yellow-600 text-white"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              📋 Version
            </button>
          </div>

          {/* Tab content */}
          {activeTab === "debug" && debugInfo && (
            <div>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Current User ID:</strong>
                  <div className="font-mono text-xs bg-gray-900 p-1 rounded mt-1">
                    {debugInfo.currentUserId}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <strong>Auth Type:</strong>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      debugInfo.isFirebaseAuth
                        ? "bg-green-600 text-white"
                        : "bg-yellow-600 text-white"
                    }`}
                  >
                    {debugInfo.isFirebaseAuth ? "Firebase" : "Anonymous"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <strong>Signed In:</strong>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      debugInfo.isSignedIn
                        ? "bg-green-600 text-white"
                        : "bg-red-600 text-white"
                    }`}
                  >
                    {debugInfo.isSignedIn ? "Yes" : "No"}
                  </span>
                </div>

                <div>
                  <strong>Domain:</strong>
                  <span className="ml-2">{window.location.hostname}</span>
                </div>

                {debugInfo.localStorageUserId && (
                  <div>
                    <strong>LocalStorage User ID:</strong>
                    <div className="font-mono text-xs bg-gray-900 p-1 rounded mt-1">
                      {debugInfo.localStorageUserId}
                    </div>
                  </div>
                )}
              </div>

              {migratableUserIds.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-600">
                  <h4 className="font-semibold text-yellow-400 mb-2">
                    🔄 Available Migrations
                  </h4>
                  <div className="space-y-2">
                    {migratableUserIds.map((userId) => (
                      <div key={userId} className="bg-gray-900 p-2 rounded">
                        <div className="font-mono text-xs mb-2">{userId}</div>
                        <button
                          onClick={() => handleMigration(userId)}
                          className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
                          disabled={migrationStatus.includes("Migrating")}
                        >
                          Migrate Data
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {migrationStatus && (
                <div className="mt-3 p-2 bg-gray-900 rounded">
                  <div className="text-xs">{migrationStatus}</div>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-gray-600">
                <button
                  onClick={loadDebugInfo}
                  className="bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-xs"
                >
                  🔄 Refresh
                </button>
              </div>
            </div>
          )}

          {/* Version tab content */}
          {activeTab === "version" && (
            <div className="space-y-2 text-sm">
              <div>
                <strong>Version:</strong>
                <div className="font-mono text-xs bg-gray-900 p-1 rounded mt-1">
                  {versionInfo.fullVersion}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <strong>Environment:</strong>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    versionInfo.environment === "production"
                      ? "bg-green-600 text-white"
                      : versionInfo.environment === "development"
                      ? "bg-yellow-600 text-white"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  {versionInfo.environment}
                </span>
              </div>

              <div>
                <strong>Built:</strong>
                <span className="ml-2 text-gray-300">
                  {versionInfo.buildDate}
                </span>
              </div>

              <div>
                <strong>Deployed:</strong>
                <span className="ml-2 text-gray-300">
                  {versionInfo.deployDate}
                </span>
              </div>

              <div>
                <strong>Commit:</strong>
                <div className="font-mono text-xs bg-gray-900 p-1 rounded mt-1">
                  {versionInfo.commitHash.substring(0, 12)}
                </div>
              </div>

              <div>
                <strong>Domain:</strong>
                <span className="ml-2 text-gray-300">
                  {window.location.hostname}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
