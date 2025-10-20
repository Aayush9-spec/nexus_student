
"use client";

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, query, where, Query, doc } from 'firebase/firestore';
import { useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import type { Listing, User } from '@/lib/types';
import { ListingGrid } from './components/ListingGrid';
import { FilterSidebar } from './components/FilterSidebar';
import { Suspense } from 'react';
import { ListingCard } from './components/ListingCard';
import { Skeleton } from '@/components/ui/skeleton';

function ListingWithSeller({ listing }: { listing: Listing }) {
    const firestore = useFirestore();

    const sellerRef = useMemoFirebase(() => {
        if (!firestore || !listing.sellerId) return null;
        return doc(firestore, 'users', listing.sellerId);
    }, [firestore, listing.sellerId]);

    const { data: seller, isLoading } = useDoc<User>(sellerRef);

    if (isLoading) {
        return <Skeleton className="h-96 rounded-lg" />;
    }

    const listingWithSeller = {
        ...listing,
        seller: seller || undefined,
    };

    return <ListingCard listing={listingWithSeller} />;
}


export default function MarketplacePage() {
  const firestore = useFirestore();
  const searchParams = useSearchParams();

  const q = searchParams.get('q');
  const category = searchParams.get('category');
  const maxPrice = searchParams.get('maxPrice');
  const location = searchParams.get('location');

  const listingsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    
    const constraints = [];
    if (category && category !== 'All') {
        constraints.push(where('category', '==', category));
    }
    if (maxPrice) {
        constraints.push(where('price', '<=', Number(maxPrice)));
    }
     if (location) {
        // Note: Firestore can't do partial string matches with inequalities.
        // For a real app, a search service like Algolia is better.
        // Here we will filter client-side.
    }
    
    let q: Query<Listing> = query(collection(firestore, 'listings') as Query<Listing>, ...constraints);
    return q;
  }, [firestore, category, maxPrice]);

  const { data: listingsData, isLoading: isLoadingListings } = useCollection<Listing>(listingsQuery);
  
  const filteredListings = useMemo(() => {
    if (!listingsData) return [];
    
    return listingsData.filter(listing => {
        const queryMatch = q ? listing.title.toLowerCase().includes(q.toLowerCase()) || listing.description.toLowerCase().includes(q.toLowerCase()) : true;
        const locationMatch = location ? (listing.college || '').toLowerCase().includes(location.toLowerCase()) : true;
        return queryMatch && locationMatch;
    });
  }, [listingsData, q, location]);


  return (
    <Suspense fallback={<div className="container mx-auto py-8">Loading...</div>}>
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <div className="sticky top-20">
              <FilterSidebar />
            </div>
          </aside>
          <main className="lg:col-span-3">
            <h1 className="text-3xl font-bold font-headline mb-6">Explore the Marketplace</h1>
            {isLoadingListings ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(9)].map((_, i) => <Skeleton key={i} className="h-96 rounded-lg" />)}
                </div>
            ) : (
                <ListingGrid listings={filteredListings.map(l => ({ ...l, seller: undefined }))} isLoading={false}>
                    {filteredListings.map(listing => <ListingWithSeller key={listing.id} listing={listing} />)}
                </ListingGrid>
            )}
          </main>
        </div>
      </div>
    </Suspense>
  );
}
