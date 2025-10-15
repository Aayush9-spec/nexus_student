"use client";

import { useMemo } from 'react';
import { collection, query, where, Query } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { Listing, User } from '@/lib/types';
import { ListingGrid } from "@/app/marketplace/components/ListingGrid";

export function UserListings({ userId }: { userId: string }) {
  const firestore = useFirestore();

  const listingsQuery = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return query(collection(firestore, 'listings'), where('sellerId', '==', userId)) as Query<Listing>;
  }, [firestore, userId]);
  
  const { data: userListings, isLoading } = useCollection<Listing>(listingsQuery);

  const userQuery = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return query(collection(firestore, 'users'), where('id', '==', userId)) as Query<User>;
  }, [firestore, userId]);

  const { data: userData } = useCollection<User>(userQuery);
  const user = userData?.[0];

  const listingsWithSeller = useMemo(() => {
    if (!userListings || !user) return [];
    return userListings.map(listing => ({
      ...listing,
      seller: user,
    }));
  }, [userListings, user]);

  if (isLoading) {
    return (
        <div>
            <h2 className="text-2xl font-bold font-headline mb-6 animate-pulse bg-muted h-8 w-32 rounded-md"></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-muted rounded-lg h-80"></div>
                ))}
            </div>
        </div>
    )
  }

  return (
    <div>
        <h2 className="text-2xl font-bold font-headline mb-6">Listings</h2>
        <ListingGrid listings={listingsWithSeller} />
    </div>
  );
}