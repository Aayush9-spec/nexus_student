"use client";

import { useMemo } from 'react';
import { collection, query, where, Query, doc } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import type { Listing, User } from '@/lib/types';
import { ListingGrid } from "@/app/marketplace/components/ListingGrid";

export function UserListings({ userId }: { userId: string }) {
  const firestore = useFirestore();

  const listingsQuery = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return query(collection(firestore, 'listings'), where('sellerId', '==', userId)) as Query<Listing>;
  }, [firestore, userId]);
  
  const { data: userListings, isLoading } = useCollection<Listing>(listingsQuery);

  const userRef = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return doc(firestore, 'users', userId);
  }, [firestore, userId]);

  const { data: user } = useDoc<User>(userRef);

  const listingsWithSeller = useMemo(() => {
    if (!userListings || !user) return [];
    return userListings.map(listing => ({
      ...listing,
      seller: user,
    }));
  }, [userListings, user]);

  return (
    <div>
        <h2 className="text-2xl font-bold font-headline mb-6">Listings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <ListingGrid listings={listingsWithSeller} isLoading={isLoading} />
        </div>
    </div>
  );
}
