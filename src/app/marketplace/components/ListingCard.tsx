import Image from 'next/image';
import Link from 'next/link';
import type { Listing, User } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface ListingCardProps {
  listing: Listing;
  className?: string;
}

export function ListingCard({ listing, className }: ListingCardProps) {
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  };

  return (
    <Link href={`/marketplace/${listing.id}`}>
      <Card className={cn("overflow-hidden h-full flex flex-col transition-all hover:scale-[1.02] hover:shadow-lg", className)}>
        <CardHeader className="p-0">
          <div className="relative aspect-video">
            <Image
              src={listing.mediaUrl || "https://picsum.photos/seed/placeholder/600/400"}
              alt={listing.title}
              fill
              className="object-cover"
              data-ai-hint="product image"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <Badge variant="secondary" className="mb-2">{listing.category}</Badge>
          <CardTitle className="text-lg font-bold line-clamp-2 mb-2">{listing.title}</CardTitle>
          <p className="text-xl font-headline font-semibold text-primary">
            {listing.price > 0 ? `₹${listing.price.toFixed(2)}` : 'Free'}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0">
            {listing.seller && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Avatar className="h-6 w-6">
                        <AvatarImage src={listing.seller.profilePictureUrl} alt={listing.seller.name} />
                        <AvatarFallback>{getInitials(listing.seller.name)}</AvatarFallback>
                    </Avatar>
                    <span>{listing.seller.name}</span>
                </div>
            )}
        </CardFooter>
      </Card>
    </Link>
  );
}
