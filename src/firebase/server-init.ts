// IMPORTANT: This file should ONLY be imported by server-side modules ('use server').
import { initializeApp, getApps, getApp, App } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

// Memoization cache
let firestoreInstance: Firestore | null = null;
let appInstance: App | null = null;

/**
 * Initializes Firebase services for server-side usage.
 * It's crucial this is not imported into client-side code.
 * Implements memoization to avoid re-initialization on every server action.
 */
export function initializeServerSideFirestore(): { app: App, firestore: Firestore } {
  if (appInstance && firestoreInstance) {
    return { app: appInstance, firestore: firestoreInstance };
  }

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const firestore = getFirestore(app);

  // Cache the instances
  appInstance = app;
  firestoreInstance = firestore;

  return { app, firestore };
}
