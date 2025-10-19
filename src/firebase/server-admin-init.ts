import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';

const serviceAccount = process.env.FIREBASE_ADMIN_SDK_CONFIG
  ? JSON.parse(process.env.FIREBASE_ADMIN_SDK_CONFIG)
  : undefined;

// This function creates and returns a Firebase Admin App instance.
// It ensures that the app is initialized only once.
export function createFirebaseAdminApp(): App {
  // Check if there are any initialized apps. If so, return the first one.
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // If no service account is configured, throw an error.
  if (!serviceAccount) {
    throw new Error('FIREBASE_ADMIN_SDK_CONFIG environment variable is not set. Cannot initialize Firebase Admin SDK.');
  }

  // Initialize the Firebase Admin App with the service account credentials.
  const app = initializeApp({
    credential: cert(serviceAccount),
  });

  return app;
}
