/**
 * Cleanup utility to remove all albums and storage data
 * WARNING: This will permanently delete ALL albums and images
 */

import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { getStorage, ref, listAll, deleteObject } from "firebase/storage";
import { getFirebaseApp } from "@/shared/lib/firebase";

export interface DeleteAllResult {
  success: boolean;
  albumsDeleted: number;
  filesDeleted: number;
  error?: string;
}

export async function executeDeleteAll(): Promise<DeleteAllResult> {
  try {
    const app = getFirebaseApp();
    if (!app) {
      throw new Error("Firebase app not initialized");
    }

    const db = getFirestore(app);
    const storage = getStorage(app);

    console.log("🧹 Starting cleanup process...");

    // 1. Delete all Firestore album documents
    console.log("📄 Deleting Firestore documents...");
    const albumsCollection = collection(db, "albums");
    const snapshot = await getDocs(albumsCollection);

    const deletePromises = snapshot.docs.map((docSnapshot) => {
      console.log(
        `Deleting album document: ${docSnapshot.id} (${
          docSnapshot.data().title || "Untitled"
        })`
      );
      return deleteDoc(doc(db, "albums", docSnapshot.id));
    });

    await Promise.all(deletePromises);
    console.log(
      `✅ Deleted ${snapshot.docs.length} album documents from Firestore`
    );

    // 2. Delete all Storage files and folders recursively
    console.log("🗂️ Deleting Storage files...");
    let totalFilesDeleted = 0;

    // Start from the root users folder
    const usersRef = ref(storage, "users/");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async function deleteAllInFolder(folderRef: any): Promise<number> {
      try {
        const listResult = await listAll(folderRef);
        let filesDeleted = 0;

        // Delete all files in current folder
        const fileDeletePromises = listResult.items.map(async (item) => {
          console.log(`Deleting file: ${item.fullPath}`);
          await deleteObject(item);
          return 1;
        });

        const fileResults = await Promise.allSettled(fileDeletePromises);
        filesDeleted += fileResults.filter(
          (result) => result.status === "fulfilled"
        ).length;

        // Recursively delete all subfolders
        const folderPromises = listResult.prefixes.map(async (subFolder) => {
          console.log(`Processing folder: ${subFolder.fullPath}`);
          return await deleteAllInFolder(subFolder);
        });

        const folderResults = await Promise.allSettled(folderPromises);
        folderResults.forEach((result) => {
          if (result.status === "fulfilled") {
            filesDeleted += result.value;
          }
        });

        return filesDeleted;
      } catch (error) {
        console.log(
          `ℹ️ Folder ${folderRef.fullPath} not found or empty:`,
          error
        );
        return 0;
      }
    }

    totalFilesDeleted = await deleteAllInFolder(usersRef);
    console.log(`✅ Deleted ${totalFilesDeleted} files from Storage`);

    // 3. Clear localStorage user data
    console.log("🗑️ Clearing localStorage...");
    const keysToRemove = ["userId", "isSignedIn"];
    keysToRemove.forEach((key) => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`Removed ${key} from localStorage`);
      }
    });
    console.log("✅ localStorage cleared");

    console.log("🎉 Complete cleanup finished successfully!");
    console.log(
      `Summary: ${snapshot.docs.length} albums and ${totalFilesDeleted} files deleted`
    );

    return {
      success: true,
      albumsDeleted: snapshot.docs.length,
      filesDeleted: totalFilesDeleted,
    };
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    return {
      success: false,
      albumsDeleted: 0,
      filesDeleted: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Legacy function for backward compatibility (now just returns a promise)
export async function deleteAllData(): Promise<boolean> {
  const result = await executeDeleteAll();
  return result.success;
}

export default deleteAllData;
