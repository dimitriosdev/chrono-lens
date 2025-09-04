/**
 * Development component for debugging user identity issues
 * Only shown in development mode
 */
"use client";

import React, { useState, useEffect } from "react";
import {
  debugUserIdentity,
  checkForMigratableData,
  migrateFromAnonymousUser,
} from "@/utils/userMigration";

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

  // Only show in development
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      setIsVisible(true);
      loadDebugInfo();
    }
  }, []);

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

  if (!isVisible || !debugInfo) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-md">
        <h3 className="text-lg font-semibold mb-3 text-yellow-400">
          🔧 User Debug Panel (Dev Mode)
        </h3>

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
    </div>
  );
}
