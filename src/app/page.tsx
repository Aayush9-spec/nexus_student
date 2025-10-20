
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight } from 'lucide-react';
import { ListingCard } from './marketplace/components/ListingCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { collection, query, limit, Query, doc } from 'firebase/firestore';
import type { Listing, User } from '@/lib/types';
import { useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function TrendingListingCard({ listing }: { listing: Listing }) {
    const firestore = useFirestore();

    const sellerRef = useMemoFirebase(() => {
        if (!firestore || !listing.sellerId) return null;
        return doc(firestore, 'users', listing.sellerId);
    }, [firestore, listing.sellerId]);

    const { data: seller, isLoading } = useDoc<User>(sellerRef);

    if (isLoading) {
        return <Skeleton className="h-full w-full rounded-lg" />;
    }

    const listingWithSeller = {
        ...listing,
        seller: seller || undefined,
    };

    return <ListingCard listing={listingWithSeller} />;
}


function FeaturedStudentCard({ user }: { user: User }) {
    const getInitials = (name: string) => {
        if (!name) return '';
        const names = name.split(' ');
        if (names.length > 1) {
          return `${names[0][0]}${names[names.length - 1][0]}`;
        }
        return name.substring(0, 2);
    };

    return (
        <Link href={`/profile/${user.id}`}>
            <Card className="hover:shadow-lg transition-shadow h-full">
                <CardContent className="flex flex-col items-center text-center p-6">
                    <Avatar className="w-24 h-24 mb-4 border-4 border-accent">
                        <AvatarImage src={user.profilePictureUrl} alt={user.name} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold text-lg">{user.name}</h3>
                    <p className="text-primary font-semibold">{user.college}</p>
                    <p className="text-muted-foreground text-sm mt-2 line-clamp-2">{user.bio}</p>
                </CardContent>
            </Card>
        </Link>
    );
}

function FeaturedStudentsSection() {
    const firestore = useFirestore();
    
    // Fetch users with recent activity, for now just grabbing first few from the collection
    const usersQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'users'), limit(3)) as Query<User>;
    }, [firestore]);

    const { data: users, isLoading: isLoadingUsers } = useCollection<User>(usersQuery);

    if (isLoadingUsers) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="bg-card rounded-lg h-64" />)}
            </div>
        );
    }
    
    if (!users || users.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-8 col-span-full">
                <p>No featured students to show right now.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map(user => <FeaturedStudentCard key={user.id} user={user} />)}
        </div>
    );
}


export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-image');
  const firestore = useFirestore();

  const trendingQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'listings'), limit(4)) as Query<Listing>;
  }, [firestore]);

  const { data: trendingListings, isLoading: trendingLoading } = useCollection<Listing>(trendingQuery);

  return (
    <div className="flex flex-col">
      <section className="relative w-full h-[50vh] md:h-[60vh] text-white">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover"
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative h-full flex flex-col items-center justify-center text-center p-4">
          <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 drop-shadow-lg">
            The Student-Powered Marketplace
          </h1>
          <p className="text-lg md:text-2xl mb-8 max-w-3xl drop-shadow-md">
            Discover, buy, and sell goods, services, and skills within your campus community.
          </p>
          <Link href="/marketplace">
            <Button size="lg">
              Explore Marketplace <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="container mx-auto py-12 md:py-16">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-headline font-bold">Trending Listings</h2>
            <Link href="/marketplace">
                <Button variant="outline">View All <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingLoading ? (
            [...Array(4)].map((_, i) => <Skeleton key={i} className="h-96 rounded-lg" />)
          ) : (
            trendingListings?.map((listing) => <TrendingListingCard key={listing.id} listing={listing} />)
          )}
        </div>
      </section>

      <section className="bg-muted py-12 md:py-16">
        <div className="container mx-auto">
            <h2 className="text-2xl md:text-3xl font-headline font-bold text-center mb-8">Featured Students</h2>
            <FeaturedStudentsSection />
        </div>
      </section>
    </div>
  );
}
