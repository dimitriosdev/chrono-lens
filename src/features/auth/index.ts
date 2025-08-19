import { getFirebaseAuth } from "../../lib/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";

export async function signInWithGoogle(): Promise<User | null> {
  const auth = getFirebaseAuth();
  if (!auth) {
    console.error("Firebase auth not initialized");
    return null;
  }

  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Google sign-in error:", error);
    return null;
  }
}

export async function signOutUser(
  setIsSignedIn?: (signedIn: boolean) => void
): Promise<void> {
  const auth = getFirebaseAuth();
  if (!auth) {
    console.error("Firebase auth not initialized");
    return;
  }

  await signOut(auth);
  localStorage.setItem("isSignedIn", "false");
  if (setIsSignedIn) setIsSignedIn(false);
}
