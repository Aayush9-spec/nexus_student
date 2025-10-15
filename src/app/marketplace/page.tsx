"use client";

import { useMemo } from 'react';
import { collection, query, where, Query, doc } from 'firebase/firestore';
import { useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import type { Listing, User } from '@/lib/types';
import { ListingGrid } from './components/ListingGrid';
import { FilterSidebar } from './components/FilterSidebar';
import { Suspense } from 'react';
import { ListingCard } from './components/ListingCard';


export default function MarketplacePage({ searchParams }: {
  searchParams: {
    q?: string;
    category?: string;
    maxPrice?: string;
    location?: string;
  };
}) {
  const firestore = useFirestore();

  const listingsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    let q: Query<Listing> = collection(firestore, 'listings') as Query<Listing>;
    
    // These filters are now applied on the client side below.
    // Firestore queries with inequalities on different fields are not allowed.

    return q;
  }, [firestore]);

  const { data: listingsData, isLoading: isLoadingListings } = useCollection<Listing>(listingsQuery);
  
  const { data: usersData, isLoading: isLoadingUsers } = useCollection<User>(
    useMemoFirebase(() => {
        if (!firestore) return null;
        return collection(firestore, 'users') as Query<User>;
    }, [firestore])
  );

  const listingsWithSellers = useMemo(() => {
    if (!listingsData || !usersData) return [];
    return listingsData.map(listing => {
      const seller = usersData.find(u => u.id === listing.sellerId);
      return { ...listing, seller };
    });
  }, [listingsData, usersData]);

  const filteredListings = useMemo(() => {
    return listingsWithSellers.filter(listing => {
        const queryMatch = searchParams.q ? listing.title.toLowerCase().includes(searchParams.q.toLowerCase()) || listing.description.toLowerCase().includes(searchParams.q.toLowerCase()) : true;
        const categoryMatch = searchParams.category ? listing.category === searchParams.category : true;
        const priceMatch = searchParams.maxPrice ? listing.price <= Number(searchParams.maxPrice) : true;
        const locationMatch = searchParams.location ? listing.seller && listing.seller.college.toLowerCase().includes(searchParams.location.toLowerCase()) : true;
        return queryMatch && categoryMatch && priceMatch && locationMatch;
    });
  }, [listingsWithSellers, searchParams]);

  const isLoading = isLoadingListings || isLoadingUsers;

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="sticky top-20">
              <Suspense fallback={<div>Loading filters...</div>}>
                <FilterSidebar />
              </Suspense>
            </div>
          </aside>
          <main className="lg:col-span-3">
            <h1 className="text-3xl font-bold font-headline mb-6">Explore the Marketplace</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse bg-muted rounded-lg h-80"></div>
              ))}
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <div className="sticky top-20">
            <Suspense fallback={<div>Loading filters...</div>}>
              <FilterSidebar />
            </Suspense>
          </div>
        </aside>
        <main className="lg:col-span-3">
          <h1 className="text-3xl font-bold font-headline mb-6">Explore the Marketplace</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <ListingGrid listings={filteredListings} />
          </div>
        </main>
      </div>
    </div>
  );
}
