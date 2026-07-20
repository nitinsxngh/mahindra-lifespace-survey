import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function createFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  if (
    !firebaseConfig.apiKey ||
    !firebaseConfig.authDomain ||
    !firebaseConfig.projectId ||
    !firebaseConfig.appId
  ) {
    throw new Error("Firebase client configuration is missing.");
  }

  return initializeApp(firebaseConfig);
}

let authInstance: Auth | null = null;

export function getFirebaseAuth(): Auth {
  if (!authInstance) {
    authInstance = getAuth(createFirebaseApp());
  }
  return authInstance;
}

export function toFirebasePhone(phone: string): string {
  const normalized = phone.replace(/\D/g, "").slice(-10);
  return `+91${normalized}`;
}
