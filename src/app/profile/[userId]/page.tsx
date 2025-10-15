
"use client";

import React from 'react';
import { notFound } from 'next/navigation';
import { ProfileHeader } from "../components/ProfileHeader";
import { UserListings } from "../components/UserListings";
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';

// Helper component to handle the data fetching and rendering logic
function ProfileView({ userId }: { userId: string }) {
  const firestore = useFirestore();
  const { user: currentUser } = useAuth();

  const userRef = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return doc(firestore, 'users', userId);
  }, [firestore, userId]);

  const { data: user, isLoading } = useDoc<User>(userRef);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-8">
          <div className="bg-card p-6 md:p-8 rounded-lg animate-pulse">
             <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-32 h-32 rounded-full bg-muted"></div>
                <div className="flex-grow text-center md:text-left space-y-3">
                    <div className="h-8 bg-muted rounded w-48 mx-auto md:mx-0"></div>
                    <div className="h-6 bg-muted rounded w-32 mx-auto md:mx-0"></div>
                </div>
            </div>
          </div>
          <div>
            <div className="h-8 bg-muted rounded w-40 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-muted rounded-lg h-80"></div>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    notFound();
  }
  
  const isOwnProfile = currentUser?.id === user.id;

  return (
    <div className="container mx-auto py-8">
        <div className="space-y-8">
            <ProfileHeader user={user} isOwnProfile={isOwnProfile} />
            <UserListings userId={user.id} />
        </div>
    </div>
  );
}


export default function ProfilePage({ params }: { params: { userId: string } }) {
  // The 'params' object is a "thenable" and must be unwrapped.
  // We can create a simple component that awaits the params and then renders the actual page content.
  // Or, more simply, we can extract the userId here and pass it down.
  // The error log suggests `React.use()` but that can only be used in a Client Component that is not async.
  // A simple way to solve this is to pass the param to a client component that handles the logic.
  const userId = params.userId;

  return <ProfileView userId={userId} />;
}
