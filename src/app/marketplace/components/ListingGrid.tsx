import type { Listing } from '@/lib/types';
import { ListingCard } from './ListingCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ListingGridProps {
  listings: Listing[];
  isLoading?: boolean;
}

export function ListingGrid({ listings, isLoading }: ListingGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse bg-muted rounded-lg h-80"></div>
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
        <div className="text-center py-16 text-muted-foreground col-span-full">
            <h2 className="text-2xl font-semibold">No listings found</h2>
            <p className='mb-4'>Try adjusting your search or filters.</p>
            <Link href="/new-listing">
                <Button>Create a Listing</Button>
            </Link>
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
