
"use client";

import { useMemo } from 'react';
import { collection, query, where, Query, doc } from 'firebase/firestore';
import { useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import type { Listing, User } from '@/lib/types';
import { ListingGrid } from './components/ListingGrid';
import { FilterSidebar } from './components/FilterSidebar';
import { Suspense } from 'react';
import { ListingCard } from './components/ListingCard';


function ListingWithSeller({ listing }: { listing: Listing }) {
    const firestore = useFirestore();

    const sellerRef = useMemoFirebase(() => {
        if (!firestore || !listing.sellerId) return null;
        return doc(firestore, 'users', listing.sellerId);
    }, [firestore, listing.sellerId]);

    const { data: seller, isLoading } = useDoc<User>(sellerRef);

    if (isLoading) {
        return <div className="animate-pulse bg-muted rounded-lg h-80"></div>;
    }

    const listingWithSeller = {
        ...listing,
        seller: seller || undefined,
    };

    return <ListingCard listing={listingWithSeller} />;
}


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
    return q;
  }, [firestore]);

  const { data: listingsData, isLoading: isLoadingListings } = useCollection<Listing>(listingsQuery);
  
  const filteredListings = useMemo(() => {
    if (!listingsData) return [];
    return listingsData.filter(listing => {
        const queryMatch = searchParams.q ? listing.title.toLowerCase().includes(searchParams.q.toLowerCase()) || listing.description.toLowerCase().includes(searchParams.q.toLowerCase()) : true;
        const categoryMatch = searchParams.category ? listing.category === searchParams.category : true;
        const priceMatch = searchParams.maxPrice ? listing.price <= Number(searchParams.maxPrice) : true;
        const locationMatch = searchParams.location ? listing.college.toLowerCase().includes(searchParams.location.toLowerCase()) : true;
        return queryMatch && categoryMatch && priceMatch && locationMatch;
    });
  }, [listingsData, searchParams]);


  if (isLoadingListings) {
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
           {filteredListings && filteredListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredListings.map(listing => <ListingWithSeller key={listing.id} listing={listing} />)}
              </div>
            ) : (
               <div className="text-center py-16 text-muted-foreground col-span-full">
                  <h2 className="text-2xl font-semibold">No listings found</h2>
                  <p>Try adjusting your search or filters, or create a new listing!</p>
              </div>
            )}
        </main>
      </div>
    </div>
  );
}
