'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    try {
      return initializeFirebase();
    } catch (error) {
      console.error("Failed to initialize Firebase:", error);
      return null;
    }
  }, []);

  if (!firebaseServices) {
    console.error("Firebase initialization failed. Rendering app with null services.");
    // Fallback to render provider with nulls so context exists and doesn't crash downstream components during build
    return (
      <FirebaseProvider
        firebaseApp={undefined as any}
        auth={undefined as any}
        firestore={undefined as any}
      >
        {children}
      </FirebaseProvider>
    );
  }

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
