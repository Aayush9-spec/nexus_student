"use client";

import { useMemo } from 'react';
import { collection, query, where, Query, doc } from 'firebase/firestore';
import { useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
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

function ListingWithSeller({ listing, searchParams }: { listing: Listing, searchParams: MarketplacePageProps['searchParams'] }) {
  const firestore = useFirestore();
  const sellerRef = useMemoFirebase(() => {
    if (!firestore || !listing.sellerId) return null;
    return doc(firestore, 'users', listing.sellerId);
  }, [firestore, listing.sellerId]);

  const { data: seller, isLoading } = useDoc<User>(sellerRef);

  const listingWithSeller = useMemo(() => ({
    ...listing,
    seller: seller || undefined,
  }), [listing, seller]);
  
  const isVisible = useMemo(() => {
    const l = listingWithSeller;
    const queryMatch = searchParams.q ? l.title.toLowerCase().includes(searchParams.q.toLowerCase()) || l.description.toLowerCase().includes(searchParams.q.toLowerCase()) : true;
    const categoryMatch = searchParams.category ? l.category === searchParams.category : true;
    const priceMatch = searchParams.maxPrice ? l.price <= Number(searchParams.maxPrice) : true;
    
    const selectedColleges = searchParams.colleges?.split(',');
    const collegeMatch = selectedColleges && selectedColleges.length > 0 ? l.seller && selectedColleges.includes(l.seller.college) : true;

    const locationMatch = searchParams.location ? l.seller && l.seller.college.toLowerCase().includes(searchParams.location.toLowerCase()) : true;

    return queryMatch && categoryMatch && priceMatch && collegeMatch && locationMatch;
  }, [listingWithSeller, searchParams]);

  if (isLoading) {
    return <div className="animate-pulse bg-muted rounded-lg h-80"></div>;
  }
  
  if (!isVisible) return null;

  return <ListingCard listing={listingWithSeller} />;
}

export default function MarketplacePage({ searchParams }: MarketplacePageProps) {
  const firestore = useFirestore();

  const listingsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'listings') as Query<Listing>;
  }, [firestore]);

  const { data: listingsData, isLoading: isLoadingListings } = useCollection<Listing>(listingsQuery);
  
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

  const filteredListings = listingsData?.filter(listing => {
      const queryMatch = searchParams.q ? listing.title.toLowerCase().includes(searchParams.q.toLowerCase()) || listing.description.toLowerCase().includes(searchParams.q.toLowerCase()) : true;
      const categoryMatch = searchParams.category ? listing.category === searchParams.category : true;
      const priceMatch = searchParams.maxPrice ? listing.price <= Number(searchParams.maxPrice) : true;
      // Note: college and location filters are now applied inside ListingWithSeller
      return queryMatch && categoryMatch && priceMatch;
  });


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
            {filteredListings && filteredListings.length > 0 ? (
                 filteredListings.map(listing => (
                    <ListingWithSeller key={listing.id} listing={listing} searchParams={searchParams} />
                ))
            ) : (
                 <div className="text-center py-16 text-muted-foreground col-span-full">
                    <h2 className="text-2xl font-semibold">No listings found</h2>
                    <p>Try adjusting your search or filters.</p>
                </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
