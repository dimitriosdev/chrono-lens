import { storage } from "./firebase";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

export async function uploadImage(
  file: File,
  albumId: string,
  idx: number
): Promise<string> {
  const storageRef = ref(
    storage,
    `albums/${albumId}/${Date.now()}_${idx}_${file.name}`
  );
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

export async function deleteImage(url: string): Promise<void> {
  // Convert download URL to storage path
  // Example: https://firebasestorage.googleapis.com/v0/b/<bucket>/o/albums%2FalbumId%2Ffilename?alt=media
  // We need albums/albumId/filename
  try {
    const matches = url.match(/\/o\/(.+)\?/);
    if (!matches || !matches[1]) throw new Error("Invalid storage URL");
    const path = decodeURIComponent(matches[1]);
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (err) {
    // Optionally log error
  }
}
