"use client";

import React, { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { ProfileHeader } from "../components/ProfileHeader";
import { UserListings } from "../components/UserListings";
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

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

function ClientOnly({ children }: { children: React.ReactNode }) {
    const [hasMounted, setHasMounted] = useState(false);
    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        return null;
    }

    return <>{children}</>;
}


export default function ProfilePage({ params }: { params: { userId: string } }) {
  const userId = params.userId;

  if (!userId) {
    notFound();
  }

  return (
    <ClientOnly>
      <ProfileView userId={userId} />
    </ClientOnly>
  );
}
