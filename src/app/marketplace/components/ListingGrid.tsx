import type { Listing } from '@/lib/types';
import { ListingCard } from './ListingCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ListingGridProps {
  listings: Listing[];
  isLoading?: boolean;
  children?: React.ReactNode;
}

export function ListingGrid({ listings, isLoading, children }: ListingGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse bg-muted rounded-lg h-96"></div>
        ))}
      </div>
    );
  }

  if (!children && listings.length === 0) {
    return (
        <div className="text-center py-16 text-muted-foreground col-span-full">
            <h2 className="text-2xl font-semibold">No listings found</h2>
            <p className='mb-4'>Try adjusting your search or filters.</p>
            <Link href="/new-listing">
                <Button>Be the first to create one!</Button>
            </Link>
        </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {children || listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
