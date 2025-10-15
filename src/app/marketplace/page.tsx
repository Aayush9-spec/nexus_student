
"use client";

import { useMemo } from 'react';
import { collection, query, where, Query, doc } from 'firebase/firestore';
import { useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import type { Listing, User } from '@/lib/types';
import { ListingGrid } from './components/ListingGrid';
import { FilterSidebar } from './components/FilterSidebar';
import { Suspense } from 'react';
import { ListingCard } from './components/ListingCard';
import { dummyListings, dummyUsers } from '@/lib/dummy-data';


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
  
  const getDummyListingsWithSellers = () => {
    return dummyListings.map(listing => ({
      ...listing,
      seller: dummyUsers.find(user => user.id === listing.sellerId)
    }));
  };
  
  const allListings = useMemo(() => {
    if (!isLoadingListings && (!listingsData || listingsData.length === 0)) {
        return getDummyListingsWithSellers();
    }
    return listingsData || [];
  }, [listingsData, isLoadingListings])

  const { q, category, maxPrice, location } = searchParams;

  const filteredListings = useMemo(() => {
    const source = (!isLoadingListings && (!listingsData || listingsData.length === 0)) ? getDummyListingsWithSellers() : listingsData;
    if (!source) return [];
    
    return source.filter(listing => {
        const queryMatch = q ? listing.title.toLowerCase().includes(q.toLowerCase()) || listing.description.toLowerCase().includes(q.toLowerCase()) : true;
        const categoryMatch = category && category !== 'All' ? listing.category === category : true;
        const priceMatch = maxPrice ? listing.price <= Number(maxPrice) : true;
        const locationMatch = location ? listing.college.toLowerCase().includes(location.toLowerCase()) : true;
        return queryMatch && categoryMatch && priceMatch && locationMatch;
    });
  }, [listingsData, isLoadingListings, q, category, maxPrice, location]);


  const renderListings = () => {
    if (isLoadingListings) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-muted rounded-lg h-80"></div>
                ))}
            </div>
        );
    }

    if (!listingsData || listingsData.length === 0) {
        // Show filtered dummy data if live data is empty
        return <ListingGrid listings={filteredListings} isLoading={false} />;
    }
    
    // Show live listings
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredListings.map(listing => <ListingWithSeller key={listing.id} listing={listing} />)}
        </div>
    );
  };


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
           {renderListings()}
        </main>
      </div>
    </div>
  );
}
