import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";

function getPrivateKey(): string {
  const key = process.env.FIREBASE_PRIVATE_KEY;
  if (!key) {
    throw new Error("FIREBASE_PRIVATE_KEY is not set");
  }
  return key.replace(/\\n/g, "\n");
}

function createAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (!projectId || !clientEmail) {
    throw new Error("Firebase admin configuration is missing.");
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: getPrivateKey(),
    }),
  });
}

let adminAuthInstance: Auth | null = null;

export function getFirebaseAdminAuth(): Auth {
  if (!adminAuthInstance) {
    adminAuthInstance = getAuth(createAdminApp());
  }
  return adminAuthInstance;
}

export async function verifyFirebaseIdToken(idToken: string) {
  const auth = getFirebaseAdminAuth();
  return auth.verifyIdToken(idToken);
}
