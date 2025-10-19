
"use client";

import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { Auth, User as FirebaseAuthUser, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth as useFirebaseAuthHook, useFirestore } from '@/firebase';
import type { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (name: string, email: string, pass: string, college: string, profilePicUrl: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useFirebaseAuthHook();
  const firestore = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth || !firestore) return;

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: FirebaseAuthUser | null) => {
      if (firebaseUser) {
        const userDocRef = doc(firestore, "users", firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUser({ id: userDoc.id, ...userDoc.data() } as User);
        } else {
           // If doc doesn't exist, create it. This can happen with Google Sign-In.
          const newUser: Omit<User, 'id'> = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || 'Nexus User',
            email: firebaseUser.email!,
            college: 'Unknown', // Or try to infer from email
            verified: firebaseUser.emailVerified,
            profilePictureUrl: firebaseUser.photoURL || '',
            createdAt: new Date().toISOString(),
            bio: 'Welcome to Nexus 2.0!',
            rating: 0,
            totalSales: 0,
            sellerLevel: 'Newbie',
            xpPoints: 0,
            badges: [],
            nexusCredits: 0,
          };
          await setDoc(userDocRef, newUser);
          setUser({ id: firebaseUser.uid, ...newUser } as User);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, firestore]);

  const login = async (email: string, pass: string) => {
    if (!auth) throw new Error("Auth service is not available.");
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const logout = async () => {
    if (!auth) throw new Error("Auth service is not available.");
    await signOut(auth);
  };

  const signup = async (name: string, email: string, pass: string, college: string, profilePictureUrl: string) => {
    if (!auth || !firestore) throw new Error("Firebase services are not available.");
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const firebaseUser = userCredential.user;

    const newUser: Omit<User, 'id'> = {
      uid: firebaseUser.uid,
      name,
      email,
      college,
      verified: false, // Email not verified on signup
      profilePictureUrl,
      createdAt: new Date().toISOString(),
      bio: 'A new member of the Nexus community!',
      rating: 0,
      totalSales: 0,
      sellerLevel: 'Newbie',
      xpPoints: 0,
      badges: [],
      nexusCredits: 0,
    };
    
    await setDoc(doc(firestore, "users", firebaseUser.uid), newUser);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    signup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

    