"use client";

import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { Auth, User as FirebaseAuthUser, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { FirebaseContext } from '@/firebase/provider';
import type { User } from '@/lib/types';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (name: string, email: string, pass: string, college: string, profilePicUrl: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const firebaseContext = React.useContext(FirebaseContext);
  const auth = firebaseContext?.auth;
  const firestore = firebaseContext?.firestore;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth || !firestore) {
      console.warn("AuthProvider: Firebase services not available.");
      setLoading(false);
      return;
    };

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser: FirebaseAuthUser | null) => {
      if (firebaseUser) {
        const userDocRef = doc(firestore, "users", firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUser({ id: userDoc.id, ...userDoc.data() } as User);
        } else {
          // This case can happen for users created via the Firebase console before a profile is made in the app
          const newUser: User = {
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || 'Nexus User',
            email: firebaseUser.email!,
            college: 'Unknown',
            verified: firebaseUser.emailVerified,
            profilePictureUrl: firebaseUser.photoURL || `https://picsum.photos/seed/${firebaseUser.uid}/200`,
            createdAt: new Date().toISOString(),
            bio: 'Welcome to Nexus!',
            rating: 0,
            totalSales: 0,
            sellerLevel: 'Newbie',
            xpPoints: 0,
            badges: [],
            nexusCredits: 0,
            skills: [],
            following: [],
            followers: [],
          };
          // Don't await this, let it happen in the background
          setDoc(userDocRef, newUser, { merge: true });
          setUser(newUser);
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

  const signup = async (name: string, email: string, pass: string, college: string, profilePictureDataUri: string) => {
    if (!auth || !firestore) throw new Error("Firebase services are not available.");

    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const firebaseUser = userCredential.user;

    let profilePictureUrl = profilePictureDataUri;
    if (profilePictureDataUri.startsWith('data:')) {
      const storage = getStorage();
      const storageRef = ref(storage, `profilePictures/${firebaseUser.uid}`);
      try {
        const uploadResult = await uploadString(storageRef, profilePictureDataUri, 'data_url');
        profilePictureUrl = await getDownloadURL(uploadResult.ref);
      } catch (e) {
        console.error("Profile picture upload failed, falling back", e);
        profilePictureUrl = `https://picsum.photos/seed/${firebaseUser.uid}/200`;
      }
    }

    const newUser: Omit<User, 'id'> = {
      uid: firebaseUser.uid,
      name,
      email,
      college,
      verified: false,
      profilePictureUrl,
      createdAt: new Date().toISOString(),
      bio: 'A new member of the Nexus community!',
      rating: 0,
      totalSales: 0,
      sellerLevel: 'Newbie',
      xpPoints: 0,
      badges: [],
      nexusCredits: 0,
      skills: [],
      followers: [],
      following: [],
    };

    // This will create the user document. The onAuthStateChanged listener will pick it up.
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
