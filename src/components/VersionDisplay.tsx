'use client';

import { useState } from 'react';
import { getVersionInfo } from '@/lib/version';

export function VersionDisplay() {
  const [showVersion, setShowVersion] = useState(false);
  const versionInfo = getVersionInfo();

  if (!showVersion) {
    return (
      <button
        onClick={() => setShowVersion(true)}
        className="fixed bottom-4 right-4 w-8 h-8 bg-gray-800 text-white text-xs rounded-full opacity-50 hover:opacity-100 transition-opacity z-50"
        title="Show version info"
      >
        v
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 text-sm z-50 border">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-gray-800">Version Info</h3>
        <button
          onClick={() => setShowVersion(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-1 text-gray-600">
        <div>
          <span className="font-medium">Version:</span> {versionInfo.fullVersion}
        </div>
        <div>
          <span className="font-medium">Environment:</span> {versionInfo.environment}
        </div>
        <div>
          <span className="font-medium">Built:</span> {versionInfo.buildDate}
        </div>
        <div>
          <span className="font-medium">Deployed:</span> {versionInfo.deployDate}
        </div>
        <div className="text-xs text-gray-500 mt-2">
          Commit: {versionInfo.commitHash.substring(0, 12)}
        </div>
      </div>
    </div>
  );
}
