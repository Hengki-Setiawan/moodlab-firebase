'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getDatabase, Database } from 'firebase/database';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase(): { firebaseApp: FirebaseApp; auth: Auth; database: Database } {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const database = getDatabase(app);
  
  return { firebaseApp: app, auth, database };
}

export * from './provider';
export * from './client-provider';
export * from './rtdb/use-rtdb-list';
export * from './errors';
export * from './error-emitter';
