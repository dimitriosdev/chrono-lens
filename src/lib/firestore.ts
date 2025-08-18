import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  DocumentData,
  QuerySnapshot,
} from "firebase/firestore";
import { app } from "@/lib/firebase";
import { Album } from "@/entities/Album";

const db = getFirestore(app);
const albumsCollection = collection(db, "albums");

export async function getAlbum(id: string): Promise<Album | null> {
  const albumDoc = await getDoc(doc(albumsCollection, id));
  if (!albumDoc.exists()) return null;
  return albumDoc.data() as Album;
}

export async function getAlbums(): Promise<Album[]> {
  const snapshot: QuerySnapshot<DocumentData> = await getDocs(albumsCollection);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Album));
}

export async function addAlbum(album: Omit<Album, "id">): Promise<string> {
  const docRef = await addDoc(albumsCollection, album);
  return docRef.id;
}

export async function updateAlbum(
  id: string,
  album: Partial<Album>
): Promise<void> {
  await updateDoc(doc(albumsCollection, id), album);
}

export async function deleteAlbum(id: string): Promise<void> {
  await deleteDoc(doc(albumsCollection, id));
}
