

"use client";

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, query, where, Query as FirestoreQuery, getDocs } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { Listing, LocationDetails } from '@/lib/types';
import { ListingGrid } from './components/ListingGrid';
import { FilterSidebar } from './components/FilterSidebar';
import { Suspense } from 'react';
import { ListingCard } from './components/ListingCard';
import { Skeleton } from '@/components/ui/skeleton';

// Haversine distance formula
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};


function MarketplaceContent() {
  const firestore = useFirestore();
  const searchParams = useSearchParams();

  const q = searchParams.get('q');
  const category = searchParams.get('category');
  const maxPrice = searchParams.get('maxPrice');
  const locationLat = searchParams.get('lat');
  const locationLng = searchParams.get('lng');
  const locationSearchTerm = searchParams.get('location');

  const listingsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    
    const constraints = [];
    if (category && category !== 'All') {
        constraints.push(where('category', '==', category));
    }
    if (maxPrice) {
        constraints.push(where('price', '<=', Number(maxPrice)));
    }
    
    // We can't query by location directly with Firestore's basic queries.
    // So we fetch based on other filters and then filter by location client-side.
    let q: FirestoreQuery<Listing> = query(collection(firestore, 'listings') as FirestoreQuery<Listing>, ...constraints);
    return q;
  }, [firestore, category, maxPrice]);

  const { data: listingsData, isLoading: isLoadingListings } = useCollection<Listing>(listingsQuery);
  
  const filteredListings = useMemo(() => {
    if (!listingsData) return [];
    
    return listingsData.filter(listing => {
        const queryMatch = q ? listing.title.toLowerCase().includes(q.toLowerCase()) || listing.description.toLowerCase().includes(q.toLowerCase()) : true;
        
        const locationMatch = () => {
            if (locationLat && locationLng) {
                if (!listing.location) return false;
                const distance = getDistance(Number(locationLat), Number(locationLng), listing.location.lat, listing.location.lng);
                return distance <= 50; // 50km radius
            }
            if(locationSearchTerm) {
                return (listing.college || '').toLowerCase().includes(locationSearchTerm.toLowerCase()) || (listing.location?.formatted_address || '').toLowerCase().includes(locationSearchTerm.toLowerCase());
            }
            return true;
        };

        return queryMatch && locationMatch();
    });
  }, [listingsData, q, locationLat, locationLng, locationSearchTerm]);


  return (
    <div className="container mx-auto py-8">
       <div className="flex flex-col lg:flex-row lg:gap-8">
        <aside className="w-full lg:w-1/4 mb-8 lg:mb-0">
          <div className="sticky top-20">
            <FilterSidebar />
          </div>
        </aside>
        <main className="flex-1">
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

