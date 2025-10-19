'use client';

import { useState, useEffect } from 'react';
import {
  DatabaseReference,
  onValue,
  off,
  DataSnapshot,
} from 'firebase/database';

/** Utility type to add an 'id' field to a given type T. */
export type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useRtdbList hook.
 * @template T Type of the document data.
 */
export interface UseRtdbListResult<T> {
  data: WithId<T>[] | null; // Document data with ID, or null.
  isLoading: boolean;       // True if loading.
  error: Error | null; // Error object, or null.
}

/**
 * React hook to subscribe to a list from Firebase Realtime Database.
 * Handles nullable references.
 *
 * @template T Optional type for document data. Defaults to any.
 * @param {DatabaseReference | null | undefined} memoizedRef -
 * The Firebase Realtime Database reference to a list/node. Waits if null/undefined.
 * @returns {UseRtdbListResult<T>} Object with data, isLoading, error.
 */
export function useRtdbList<T = any>(
  memoizedRef: (DatabaseReference & { __memo?: boolean }) | null | undefined
): UseRtdbListResult<T> {
  type ResultItemType = WithId<T>;
  type StateDataType = ResultItemType[] | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!memoizedRef) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = onValue(
      memoizedRef,
      (snapshot: DataSnapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          
          if (val && typeof val === 'object') {
              const results: ResultItemType[] = Object.keys(val).map(key => ({
                ...(val[key] as T),
                id: key, // The object key is the ID
              }));
              setData(results);
          } else {
              setData([]);
          }

        } else {
          // Path does not exist
          setData([]);
        }
        setError(null);
        setIsLoading(false);
      },
      (error: Error) => {
        // Handle permission errors
        console.error("RTDB Permission Error or other error:", error);
        setError(error);
        setData(null);
        setIsLoading(false);
      }
    );

    return () => off(memoizedRef, 'value', unsubscribe);
  }, [memoizedRef]);

  if (memoizedRef && !memoizedRef.__memo) {
    throw new Error('DatabaseReference was not properly memoized using useMemoFirebase');
  }

  return { data, isLoading, error };
}
