import { dummyListings, dummyUsers } from '@/lib/dummy-data';
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
  
  const filteredListings = dummyListings.filter(listing => {
    const queryMatch = searchParams.q ? listing.title.toLowerCase().includes(searchParams.q.toLowerCase()) || listing.description.toLowerCase().includes(searchParams.q.toLowerCase()) : true;
    const categoryMatch = searchParams.category ? listing.category === searchParams.category : true;
    const priceMatch = searchParams.maxPrice ? listing.price <= Number(searchParams.maxPrice) : true;
    
    const selectedColleges = searchParams.colleges?.split(',');
    const collegeMatch = selectedColleges && selectedColleges.length > 0 ? listing.seller && selectedColleges.includes(listing.seller.college) : true;

    const locationMatch = searchParams.location ? listing.seller && listing.seller.college.toLowerCase().includes(searchParams.location.toLowerCase()) : true;

    return queryMatch && categoryMatch && priceMatch && collegeMatch && locationMatch;
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
          <ListingGrid listings={filteredListings} />
        </main>
      </div>
    </div>
  );
}
