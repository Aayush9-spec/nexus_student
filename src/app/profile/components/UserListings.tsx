import { dummyListings } from "@/lib/dummy-data";
import { ListingGrid } from "@/app/marketplace/components/ListingGrid";

export function UserListings({ userId }: { userId: string }) {
  const userListings = dummyListings.filter(l => l.sellerId === userId);

  return (
    <div>
        <h2 className="text-2xl font-bold font-headline mb-6">Listings</h2>
        <ListingGrid listings={userListings} />
    </div>
  );
}
