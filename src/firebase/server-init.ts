// IMPORTANT: This file should ONLY be imported by server-side modules ('use server').
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

/**
 * Initializes Firebase services for server-side usage.
 * It's crucial this is not imported into client-side code.
 */
export function initializeServerSideFirebase() {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const db = getFirestore(app);

  return { app, db };
}
