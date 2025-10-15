"use client";

import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Star, MapPin } from 'lucide-react';
import { useDoc, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, where, Query as FirestoreQuery } from 'firebase/firestore';
import type { Listing, User, Review as ReviewType } from '@/lib/types';
import { useMemo } from 'react';
import { AddReviewForm } from './components/AddReviewForm';
import { ReviewCard } from './components/ReviewCard';
import { useAuth } from '@/hooks/use-auth';

export default function ListingDetailPage({ params }: { params: { listingId: string } }) {
  const firestore = useFirestore();
  const { user: currentUser } = useAuth();

  const listingRef = useMemoFirebase(() => {
    if (!firestore || !params.listingId) return null;
    return doc(firestore, 'listings', params.listingId);
  }, [firestore, params.listingId]);
  
  const { data: listing, isLoading: isLoadingListing } = useDoc<Listing>(listingRef);

  const sellerRef = useMemoFirebase(() => {
    if (!firestore || !listing?.sellerId) return null;
    return doc(firestore, 'users', listing.sellerId);
  }, [firestore, listing?.sellerId]);

  const { data: seller, isLoading: isLoadingSeller } = useDoc<User>(sellerRef);

  const reviewsQuery = useMemoFirebase(() => {
    if (!firestore || !params.listingId) return null;
    return query(collection(firestore, 'reviews'), where('listingId', '==', params.listingId)) as FirestoreQuery<ReviewType>;
  }, [firestore, params.listingId]);

  const { data: reviews, isLoading: isLoadingReviews } = useCollection<ReviewType>(reviewsQuery);

  const getInitials = (name?: string) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  };

  const hasUserReviewed = useMemo(() => {
    if (!currentUser || !reviews) return false;
    return reviews.some(review => review.reviewerId === currentUser.id);
  }, [currentUser, reviews]);
  
  if (isLoadingListing || isLoadingSeller || isLoadingReviews) {
    return (
        <div className="container mx-auto py-8">
            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
                <div className="md:col-span-2 space-y-4">
                    <div className="animate-pulse bg-muted aspect-video w-full rounded-lg"></div>
                    <div className="animate-pulse bg-muted h-10 w-3/4 rounded-md"></div>
                    <div className="animate-pulse bg-muted h-6 w-1/2 rounded-md"></div>
                    <div className="space-y-2 mt-4">
                        <div className="animate-pulse bg-muted h-4 w-full rounded-md"></div>
                        <div className="animate-pulse bg-muted h-4 w-full rounded-md"></div>
                        <div className="animate-pulse bg-muted h-4 w-5/6 rounded-md"></div>
                    </div>
                </div>
                <div className="md:col-span-1">
                     <div className="animate-pulse bg-muted rounded-lg h-64"></div>
                </div>
            </div>
        </div>
    )
  }

  if (!listing) {
    notFound();
  }

  const canAddReview = currentUser && currentUser.id !== listing.sellerId && !hasUserReviewed;

  return (
    <div className="container mx-auto py-8">
      <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
        <div className="md:col-span-2">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg mb-4">
            <Image
              src={listing.mediaUrl || "https://picsum.photos/seed/placeholder/800/600"}
              alt={listing.title}
              fill
              className="object-cover"
              data-ai-hint="product image"
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-headline mb-2">{listing.title}</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary">{listing.category}</Badge>
            {listing.college && (
                <Badge variant="outline" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {listing.college}
                </Badge>
            )}
          </div>
          <p className="text-lg mt-4 text-foreground/80">{listing.description}</p>
        </div>
        <div className="md:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-4xl font-headline text-primary">
                {listing.price > 0 ? `₹${listing.price.toFixed(2)}` : 'Free'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button size="lg" className="w-full">
                {listing.price > 0 ? 'Buy Now' : 'Get Item'}
              </Button>
              {seller && (
                <>
                  <Separator />
                  <Link href={`/profile/${seller.id}`}>
                    <div className="flex items-center gap-4 text-sm text-foreground hover:bg-muted p-2 rounded-md">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={seller.profilePictureUrl} alt={seller.name} />
                        <AvatarFallback>{getInitials(seller.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">Sold by {seller.name}</p>
                        <p className="text-muted-foreground">{seller.college}</p>
                      </div>
                    </div>
                  </Link>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Separator className="my-12" />

      <div>
        <h2 className="text-2xl font-bold font-headline mb-6">Reviews ({reviews?.length || 0})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                {reviews && reviews.length > 0 ? (
                    reviews.map(review => (
                        <ReviewCard key={review.id} review={review} />
                    ))
                ) : (
                    <div className="text-center text-muted-foreground py-8">
                        <p>No reviews yet for this listing. Be the first!</p>
                    </div>
                )}
            </div>
            <div>
              {canAddReview ? (
                  <AddReviewForm listingId={listing.id} />
              ) : (
                <Card className="bg-muted p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    { !currentUser ? "You must be logged in to leave a review." 
                      : currentUser.id === listing.sellerId ? "You cannot review your own listing."
                      : hasUserReviewed ? "You have already reviewed this listing."
                      : "Login to leave a review."
                    }
                  </p>
                </Card>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}
