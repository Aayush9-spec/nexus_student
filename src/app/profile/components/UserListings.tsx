"use client";

import { useMemo } from 'react';
import { collection, query, where, Query } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { Listing } from '@/lib/types';
import { ListingGrid } from "@/app/marketplace/components/ListingGrid";

export function UserListings({ userId }: { userId: string }) {
  const firestore = useFirestore();

  const listingsQuery = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return query(collection(firestore, 'listings'), where('sellerId', '==', userId)) as Query<Listing>;
  }, [firestore, userId]);

  const { data: userListings, isLoading, error } = useCollection<Listing>(listingsQuery);

  if (error) {
    return (
      <div>
        <h2 className="text-2xl font-bold font-headline mb-6">Listings</h2>
        <div className="p-8 text-center text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
          <p>Unable to load listings.</p>
          <p className="text-sm opacity-80 mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold font-headline mb-6">Listings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <ListingGrid listings={userListings || []} isLoading={isLoading} />
      </div>
    </div>
  );
}
