// Authentication related types
export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

export interface AuthState {
  isSignedIn: boolean;
  user: User | null;
  loading: boolean;
}

export interface AuthContextType {
  isSignedIn: boolean;
  setIsSignedIn: (signedIn: boolean) => void;
  loading: boolean;
  user?: User | null;
}

export interface SignInResult {
  success: boolean;
  user?: User;
  error?: string;
}
