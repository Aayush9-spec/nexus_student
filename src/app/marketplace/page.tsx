
"use client";

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, query, where, Query } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { Listing } from '@/lib/types';
import { ListingGrid } from './components/ListingGrid';
import { FilterSidebar } from './components/FilterSidebar';
import { Suspense } from 'react';
import { ListingCard } from './components/ListingCard';
import { Skeleton } from '@/components/ui/skeleton';

function MarketplaceContent() {
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
        // Note: Firestore can't do partial string matches with inequalities on different fields.
        // For a real app, a search service like Algolia is better for this.
        // We will filter the location client-side after the initial query.
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
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <div className="sticky top-20">
            <FilterSidebar />
          </div>
        </aside>
        <main className="lg:col-span-3">
          <h1 className="text-3xl font-bold font-headline mb-6">Explore the Marketplace</h1>
          <ListingGrid listings={filteredListings} isLoading={isLoadingListings} />
        </main>
      </div>
    </div>
  );
}


export default function MarketplacePage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-8">Loading filters...</div>}>
      <MarketplaceContent />
    </Suspense>
  );
}
