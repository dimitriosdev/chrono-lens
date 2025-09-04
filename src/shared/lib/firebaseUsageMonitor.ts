/**
 * Firebase Usage Monitor
 * Tracks and prevents exceeding Firebase free tier limits
 */

export interface FirebaseUsageLimits {
  /** Firestore read operations per day */
  dailyReads: number;
  /** Firestore write operations per day */
  dailyWrites: number;
  /** Storage usage in bytes */
  storageBytes: number;
  /** Maximum file size in bytes */
  maxFileSize: number;
  /** Maximum files per album */
  maxFilesPerAlbum: number;
  /** Maximum albums per user */
  maxAlbumsPerUser: number;
}

export interface UsageStats {
  reads: number;
  writes: number;
  storageUsed: number;
  lastReset: number;
  filesUploaded: number;
  albumsCreated: number;
}

// Firebase Free Tier Limits (with safety margins)
export const FIREBASE_LIMITS: FirebaseUsageLimits = {
  dailyReads: 45000, // 45k instead of 50k for safety margin
  dailyWrites: 18000, // 18k instead of 20k for safety margin
  storageBytes: 900 * 1024 * 1024, // 900MB instead of 1GB for safety margin
  maxFileSize: 10 * 1024 * 1024, // 10MB per file
  maxFilesPerAlbum: 50,
  maxAlbumsPerUser: 20,
};

class FirebaseUsageMonitor {
  private static instance: FirebaseUsageMonitor;
  private readonly storageKey = "firebase_usage_stats";
  private readonly resetInterval = 24 * 60 * 60 * 1000; // 24 hours

  private constructor() {}

  static getInstance(): FirebaseUsageMonitor {
    if (!FirebaseUsageMonitor.instance) {
      FirebaseUsageMonitor.instance = new FirebaseUsageMonitor();
    }
    return FirebaseUsageMonitor.instance;
  }

  /**
   * Get current usage statistics
   */
  getUsageStats(): UsageStats {
    if (typeof window === "undefined") {
      return this.getDefaultStats();
    }

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) {
        return this.getDefaultStats();
      }

      const stats: UsageStats = JSON.parse(stored);

      // Check if we need to reset daily counters
      const now = Date.now();
      if (now - stats.lastReset > this.resetInterval) {
        return this.resetDailyCounters(stats);
      }

      return stats;
    } catch (error) {
      console.warn("Failed to get usage stats:", error);
      return this.getDefaultStats();
    }
  }

  /**
   * Check if an operation would exceed limits
   */
  canPerformOperation(
    operation: "read" | "write" | "upload",
    count: number = 1
  ): {
    allowed: boolean;
    reason?: string;
    currentUsage?: UsageStats;
  } {
    const stats = this.getUsageStats();

    switch (operation) {
      case "read":
        if (stats.reads + count > FIREBASE_LIMITS.dailyReads) {
          return {
            allowed: false,
            reason: `Daily read limit exceeded. Used: ${stats.reads}/${FIREBASE_LIMITS.dailyReads}`,
            currentUsage: stats,
          };
        }
        break;

      case "write":
        if (stats.writes + count > FIREBASE_LIMITS.dailyWrites) {
          return {
            allowed: false,
            reason: `Daily write limit exceeded. Used: ${stats.writes}/${FIREBASE_LIMITS.dailyWrites}`,
            currentUsage: stats,
          };
        }
        break;

      case "upload":
        // This is handled separately by file size validation
        break;
    }

    return { allowed: true, currentUsage: stats };
  }

  /**
   * Record a Firebase operation
   */
  recordOperation(operation: "read" | "write", count: number = 1): void {
    if (typeof window === "undefined") return;

    try {
      const stats = this.getUsageStats();

      switch (operation) {
        case "read":
          stats.reads += count;
          break;
        case "write":
          stats.writes += count;
          break;
      }

      localStorage.setItem(this.storageKey, JSON.stringify(stats));

      // Log warnings when approaching limits
      this.checkAndWarnLimits(stats);
    } catch (error) {
      console.warn("Failed to record operation:", error);
    }
  }

  /**
   * Record file upload and storage usage
   */
  recordFileUpload(fileSizeBytes: number): {
    allowed: boolean;
    reason?: string;
  } {
    if (typeof window === "undefined") {
      return { allowed: true };
    }

    try {
      const stats = this.getUsageStats();

      // Check if adding this file would exceed storage limit
      if (stats.storageUsed + fileSizeBytes > FIREBASE_LIMITS.storageBytes) {
        return {
          allowed: false,
          reason: `Storage limit would be exceeded. Current: ${this.formatBytes(
            stats.storageUsed
          )}, Adding: ${this.formatBytes(
            fileSizeBytes
          )}, Limit: ${this.formatBytes(FIREBASE_LIMITS.storageBytes)}`,
        };
      }

      // Record the upload
      stats.storageUsed += fileSizeBytes;
      stats.filesUploaded += 1;

      localStorage.setItem(this.storageKey, JSON.stringify(stats));

      this.checkAndWarnLimits(stats);

      return { allowed: true };
    } catch (error) {
      console.warn("Failed to record file upload:", error);
      return { allowed: true }; // Allow on error to not break functionality
    }
  }

  /**
   * Record file deletion (reduce storage usage)
   */
  recordFileDeletion(fileSizeBytes: number): void {
    if (typeof window === "undefined") return;

    try {
      const stats = this.getUsageStats();
      stats.storageUsed = Math.max(0, stats.storageUsed - fileSizeBytes);
      localStorage.setItem(this.storageKey, JSON.stringify(stats));
    } catch (error) {
      console.warn("Failed to record file deletion:", error);
    }
  }

  /**
   * Record album creation
   */
  recordAlbumCreation(): {
    allowed: boolean;
    reason?: string;
  } {
    if (typeof window === "undefined") {
      return { allowed: true };
    }

    try {
      const stats = this.getUsageStats();

      if (stats.albumsCreated >= FIREBASE_LIMITS.maxAlbumsPerUser) {
        return {
          allowed: false,
          reason: `Maximum albums per user exceeded: ${stats.albumsCreated}/${FIREBASE_LIMITS.maxAlbumsPerUser}`,
        };
      }

      stats.albumsCreated += 1;
      localStorage.setItem(this.storageKey, JSON.stringify(stats));

      return { allowed: true };
    } catch (error) {
      console.warn("Failed to record album creation:", error);
      return { allowed: true };
    }
  }

  /**
   * Get usage summary for display
   */
  getUsageSummary(): {
    reads: { used: number; limit: number; percentage: number };
    writes: { used: number; limit: number; percentage: number };
    storage: {
      used: number;
      limit: number;
      percentage: number;
      usedFormatted: string;
      limitFormatted: string;
    };
    timeUntilReset: number;
  } {
    const stats = this.getUsageStats();
    const now = Date.now();
    const timeUntilReset = this.resetInterval - (now - stats.lastReset);

    return {
      reads: {
        used: stats.reads,
        limit: FIREBASE_LIMITS.dailyReads,
        percentage: (stats.reads / FIREBASE_LIMITS.dailyReads) * 100,
      },
      writes: {
        used: stats.writes,
        limit: FIREBASE_LIMITS.dailyWrites,
        percentage: (stats.writes / FIREBASE_LIMITS.dailyWrites) * 100,
      },
      storage: {
        used: stats.storageUsed,
        limit: FIREBASE_LIMITS.storageBytes,
        percentage: (stats.storageUsed / FIREBASE_LIMITS.storageBytes) * 100,
        usedFormatted: this.formatBytes(stats.storageUsed),
        limitFormatted: this.formatBytes(FIREBASE_LIMITS.storageBytes),
      },
      timeUntilReset: Math.max(0, timeUntilReset),
    };
  }

  /**
   * Force reset usage stats (for development/testing)
   */
  resetUsageStats(): void {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify(this.getDefaultStats())
      );
      console.log("Firebase usage stats reset");
    } catch (error) {
      console.warn("Failed to reset usage stats:", error);
    }
  }

  private getDefaultStats(): UsageStats {
    return {
      reads: 0,
      writes: 0,
      storageUsed: 0,
      lastReset: Date.now(),
      filesUploaded: 0,
      albumsCreated: 0,
    };
  }

  private resetDailyCounters(stats: UsageStats): UsageStats {
    const newStats: UsageStats = {
      ...stats,
      reads: 0,
      writes: 0,
      lastReset: Date.now(),
      // Keep storage and album counters (these don't reset daily)
    };

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(newStats));
      } catch (error) {
        console.warn("Failed to reset daily counters:", error);
      }
    }

    return newStats;
  }

  private checkAndWarnLimits(stats: UsageStats): void {
    const readPercentage = (stats.reads / FIREBASE_LIMITS.dailyReads) * 100;
    const writePercentage = (stats.writes / FIREBASE_LIMITS.dailyWrites) * 100;
    const storagePercentage =
      (stats.storageUsed / FIREBASE_LIMITS.storageBytes) * 100;

    // Warning at 80%
    if (readPercentage >= 80 && readPercentage < 90) {
      console.warn(
        `🚨 Firebase read operations at ${readPercentage.toFixed(
          1
        )}% of daily limit`
      );
    }
    if (writePercentage >= 80 && writePercentage < 90) {
      console.warn(
        `🚨 Firebase write operations at ${writePercentage.toFixed(
          1
        )}% of daily limit`
      );
    }
    if (storagePercentage >= 80 && storagePercentage < 90) {
      console.warn(
        `🚨 Firebase storage at ${storagePercentage.toFixed(1)}% of limit`
      );
    }

    // Critical warning at 90%
    if (readPercentage >= 90) {
      console.error(
        `🔥 CRITICAL: Firebase reads at ${readPercentage.toFixed(
          1
        )}% - approaching limit!`
      );
    }
    if (writePercentage >= 90) {
      console.error(
        `🔥 CRITICAL: Firebase writes at ${writePercentage.toFixed(
          1
        )}% - approaching limit!`
      );
    }
    if (storagePercentage >= 90) {
      console.error(
        `🔥 CRITICAL: Firebase storage at ${storagePercentage.toFixed(
          1
        )}% - approaching limit!`
      );
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
}

// Export singleton instance
export const firebaseUsageMonitor = FirebaseUsageMonitor.getInstance();

// Add to global window object in development for easy debugging
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  interface DevWindow extends Window {
    firebaseUsageMonitor?: FirebaseUsageMonitor;
    resetFirebaseUsage?: () => void;
    getFirebaseUsage?: () => ReturnType<
      FirebaseUsageMonitor["getUsageSummary"]
    >;
  }

  const devWindow = window as DevWindow;
  devWindow.firebaseUsageMonitor = firebaseUsageMonitor;
  devWindow.resetFirebaseUsage = () => firebaseUsageMonitor.resetUsageStats();
  devWindow.getFirebaseUsage = () => firebaseUsageMonitor.getUsageSummary();
}
