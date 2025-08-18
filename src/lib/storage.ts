import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

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
