import type { Listing } from '@/lib/types';
import { ListingCard } from './ListingCard';

interface ListingGridProps {
  listings: Listing[];
  isLoading?: boolean;
}

export function ListingGrid({ listings, isLoading }: ListingGridProps) {
  if (isLoading) {
    return (
      <>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse bg-muted rounded-lg h-80"></div>
        ))}
      </>
    );
  }

  if (listings.length === 0) {
    return (
        <div className="text-center py-16 text-muted-foreground col-span-full">
            <h2 className="text-2xl font-semibold">No listings found</h2>
            <p>Try adjusting your search or filters.</p>
        </div>
    );
  }

  return (
    <>
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </>
  );
}
