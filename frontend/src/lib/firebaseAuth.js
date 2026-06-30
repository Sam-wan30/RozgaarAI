import { initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const hasFirebaseAuthConfig = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

if (!hasFirebaseAuthConfig && typeof console !== "undefined") {
  console.warn("RozgaarAI Firebase Auth is not configured. Google Sign-In will remain disabled until VITE_FIREBASE_* environment variables are set.");
}

const firebaseApp = hasFirebaseAuthConfig ? initializeApp(firebaseConfig) : null;
export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export function mapFirebaseUser(user, role = "Worker") {
  if (!user) return null;
  return {
    id: user.uid,
    uid: user.uid,
    name: user.displayName || user.email?.split("@")[0] || "RozgaarAI User",
    email: user.email,
    photoUrl: user.photoURL,
    provider: "google",
    role,
    createdAt: user.metadata?.creationTime ? new Date(user.metadata.creationTime).toISOString() : new Date().toISOString(),
    lastLogin: new Date().toISOString()
  };
}

export async function signInWithGoogleAuth(role = "Worker") {
  if (!firebaseAuth) {
    const error = new Error("Firebase Authentication is not configured.");
    error.code = "auth/not-configured";
    throw error;
  }

  await setPersistence(firebaseAuth, browserLocalPersistence);

  try {
    const result = await signInWithPopup(firebaseAuth, googleProvider);
    return mapFirebaseUser(result.user, role);
  } catch (error) {
    if (error.code === "auth/popup-blocked") {
      await signInWithRedirect(firebaseAuth, googleProvider);
      return null;
    }
    throw error;
  }
}

export function subscribeToFirebaseAuth(callback) {
  if (!firebaseAuth) return () => {};
  return onAuthStateChanged(firebaseAuth, (user) => callback(mapFirebaseUser(user)));
}

export async function signOutFirebaseAuth() {
  if (firebaseAuth) {
    await firebaseSignOut(firebaseAuth);
  }
}
