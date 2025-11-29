"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { Listing } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Video, CheckCircle2, ShoppingCart, Eye } from 'lucide-react';
import { SaveListingButton } from './SaveListingButton';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';

interface ListingCardProps {
  listing: Listing;
  className?: string;
}

export function ListingCard({ listing, className }: ListingCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();

  const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      id: listing.id,
      title: listing.title,
      price: listing.price,
      image: listing.images && listing.images.length > 0 ? listing.images[0] : listing.mediaUrl,
      quantity: 1,
      sellerId: listing.sellerId
    });
    toast({
      title: "Added to cart",
      description: `${listing.title} has been added to your cart.`,
    });
  };

  return (
    <Card className={cn(
      "group overflow-hidden h-full flex flex-col transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border-border/50 bg-card/50 backdrop-blur-sm",
      className
    )}>
      <CardHeader className="p-0">
        <div className="relative aspect-video bg-muted overflow-hidden">
          <Link href={`/marketplace/${listing.id}`} className="block w-full h-full relative z-10">
            <Image
              src={listing.images?.[0] || listing.mediaUrl || `https://image.pollinations.ai/prompt/${encodeURIComponent(listing.title)}?width=600&height=400&nologo=true`}
              alt={listing.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              data-ai-hint="product image"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {listing.mediaType === 'video' && (
              <div className="absolute bottom-2 right-2 bg-black/50 text-white p-1.5 rounded-full backdrop-blur-sm">
                <Video className="h-4 w-4" />
              </div>
            )}
            {listing.status === 'sold' && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                <span className="text-white text-lg font-bold bg-destructive px-4 py-2 rounded-full shadow-lg transform -rotate-12 border-2 border-white">SOLD</span>
              </div>
            )}
          </Link>
          <div className="absolute top-2 right-2 z-20">
            <SaveListingButton listingId={listing.id} className="bg-background/50 backdrop-blur-md hover:bg-background/80 h-8 w-8" />
          </div>
          <div className="absolute top-2 left-2 pointer-events-none">
            <Badge variant="secondary" className="backdrop-blur-md bg-background/80 shadow-sm">{listing.category}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-grow space-y-2">
        <Link href={`/marketplace/${listing.id}`} className="block">
          <CardTitle className="text-lg font-bold line-clamp-2 group-hover:text-primary transition-colors">{listing.title}</CardTitle>
        </Link>
        <div className="flex items-baseline gap-1">
          <p className="text-xl font-headline font-bold text-primary">
            {listing.price > 0 ? <><span className="font-sans">₹</span>{listing.price.toFixed(2)}</> : 'Free'}
          </p>
          {listing.price > 0 && <span className="text-xs text-muted-foreground">INR</span>}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 border-t border-border/50 mt-auto flex flex-col gap-4">
        {listing.seller && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground w-full pt-3">
            <Avatar className="h-8 w-8 border-2 border-background ring-1 ring-border">
              <AvatarImage src={listing.seller.profilePictureUrl} alt={listing.seller.name} />
              <AvatarFallback>{getInitials(listing.seller.name)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium text-foreground flex items-center gap-1">
                {listing.seller.name}
                <CheckCircle2 className="h-3 w-3 text-blue-500" fill="currentColor" stroke="white" />
              </span>
              <span className="text-xs opacity-70">Student Seller</span>
            </div>
          </div>
        )}
        <div className="flex gap-2 w-full">
          <Link href={`/marketplace/${listing.id}`} className="flex-1">
            <Button variant="secondary" className="w-full h-9 text-xs sm:text-sm hover:bg-secondary/80">
              <Eye className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Details
            </Button>
          </Link>
          <Button
            className="flex-1 h-9 text-xs sm:text-sm"
            onClick={handleAddToCart}
            disabled={listing.status === 'sold'}
          >
            <ShoppingCart className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Add to Cart
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
