import { initializeApp, getApps, getApp, cert, type App } from 'firebase-admin/app';

const serviceAccount = process.env.FIREBASE_ADMIN_SDK_CONFIG
  ? JSON.parse(process.env.FIREBASE_ADMIN_SDK_CONFIG)
  : undefined;

export function createFirebaseAdminApp(): App {
  if (getApps().length > 0) {
    return getApp();
  }

  if (!serviceAccount) {
    throw new Error('FIREBASE_ADMIN_SDK_CONFIG environment variable is not set. Cannot initialize Firebase Admin SDK.');
  }

  const app = initializeApp({
    credential: cert(serviceAccount),
  });

  return app;
}
