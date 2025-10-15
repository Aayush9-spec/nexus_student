"use client";

import { useMemo } from 'react';
import { collection, query, where, Query } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { Listing, User } from '@/lib/types';
import { ListingGrid } from './components/ListingGrid';
import { FilterSidebar } from './components/FilterSidebar';
import { Suspense } from 'react';

type MarketplacePageProps = {
  searchParams: {
    q?: string;
    category?: string;
    maxPrice?: string;
    colleges?: string;
    location?: string;
  };
};

export default function MarketplacePage({ searchParams }: MarketplacePageProps) {
  const firestore = useFirestore();

  const listingsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'listings') as Query<Listing>;
  }, [firestore]);

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'users') as Query<User>;
  }, [firestore]);

  const { data: listingsData, isLoading: isLoadingListings } = useCollection<Listing>(listingsQuery);
  const { data: usersData, isLoading: isLoadingUsers } = useCollection<User>(usersQuery);

  const listingsWithSellers = useMemo(() => {
    if (!listingsData || !usersData) return [];
    
    const usersMap = new Map(usersData.map(u => [u.id, u]));

    return listingsData.map(listing => ({
      ...listing,
      seller: usersMap.get(listing.sellerId),
    }));
  }, [listingsData, usersData]);

  const filteredListings = useMemo(() => {
    return listingsWithSellers.filter(listing => {
      const queryMatch = searchParams.q ? listing.title.toLowerCase().includes(searchParams.q.toLowerCase()) || listing.description.toLowerCase().includes(searchParams.q.toLowerCase()) : true;
      const categoryMatch = searchParams.category ? listing.category === searchParams.category : true;
      const priceMatch = searchParams.maxPrice ? listing.price <= Number(searchParams.maxPrice) : true;
      
      const selectedColleges = searchParams.colleges?.split(',');
      const collegeMatch = selectedColleges && selectedColleges.length > 0 ? listing.seller && selectedColleges.includes(listing.seller.college) : true;

      const locationMatch = searchParams.location ? listing.seller && listing.seller.college.toLowerCase().includes(searchParams.location.toLowerCase()) : true;

      return queryMatch && categoryMatch && priceMatch && collegeMatch && locationMatch;
    });
  }, [listingsWithSellers, searchParams]);

  if (isLoadingListings || isLoadingUsers) {
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
          <ListingGrid listings={filteredListings} />
        </main>
      </div>
    </div>
  );
}