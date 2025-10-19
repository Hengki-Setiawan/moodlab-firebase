import { initializeApp, getApps, getApp, type App } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

let firestoreInstance: Firestore | null = null;
let appInstance: App | null = null;

export function initializeServerSideFirestore(): { app: App, firestore: Firestore } {
  if (appInstance && firestoreInstance) {
    return { app: appInstance, firestore: firestoreInstance };
  }

  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  const firestore = getFirestore(app);

  appInstance = app;
  firestoreInstance = firestore;

  return { app, firestore };
}
