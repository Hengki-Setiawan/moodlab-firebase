// IMPORTANT: This file should ONLY be imported by server-side modules ('use server').
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { firebaseConfig } from './config';

/**
 * Initializes Firebase services for server-side usage.
 * It's crucial this is not imported into client-side code.
 */
export function initializeServerSideFirebase() {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const db = getDatabase(app);

  return { app, db };
}
