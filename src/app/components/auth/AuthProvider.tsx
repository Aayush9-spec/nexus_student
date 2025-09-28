"use client";

import type { User } from '@/lib/types';
import { dummyUsers } from '@/lib/dummy-data';
import React, { createContext, useState, ReactNode } from 'react';

// In a real app, this would be imported from a Firebase auth library
type AuthUser = {
  uid: string;
  email: string | null;
} | null;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (name: string, email: string, pass: string, college: string, profilePicUrl: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Mock login
  const login = async (email: string, pass: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    const foundUser = dummyUsers.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
    } else {
      throw new Error("User not found");
    }
    setLoading(false);
  };

  // Mock logout
  const logout = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    setUser(null);
    setLoading(false);
  };

  // Mock signup
  const signup = async (name: string, email: string, pass: string, college: string, profilePictureUrl: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newUser: User = {
      id: `user_${Date.now()}`,
      name,
      email,
      college,
      profilePictureUrl,
      role: 'student',
      bio: 'A new member of the Nexus community!',
      skills: [],
      following: [],
      followers: [],
    };
    dummyUsers.push(newUser);
    setUser(newUser);
    setLoading(false);
  };
  
  // Mock initial auth state check
  React.useEffect(() => {
    const checkUser = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      // To test a logged-in state by default, uncomment the line below
      // setUser(dummyUsers[0]);
      setLoading(false);
    };
    checkUser();
  }, []);

  const value = {
    user,
    loading,
    login,
    logout,
    signup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
