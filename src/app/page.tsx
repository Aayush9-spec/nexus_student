
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, LogIn } from 'lucide-react';
import { ListingCard } from './marketplace/components/ListingCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import { collection, query, limit, Query } from 'firebase/firestore';
import type { Listing } from '@/lib/types';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';


function ClientOnly({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) {
    const [hasMounted, setHasMounted] = useState(false);
    useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}

function AuthenticatedHomepageContent() {
    const firestore = useFirestore();

    // Trending Listings
    const trendingQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'listings'), limit(4)) as Query<Listing>;
    }, [firestore]);
    const { data: trendingListings, isLoading: trendingLoading } = useCollection<Listing>(trendingQuery);
    
    return (
        <>
            <section className="container mx-auto py-12 md:py-16">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-headline font-bold">Trending Listings</h2>
                    <Link href="/marketplace">
                        <Button variant="outline">View All <ArrowRight className="ml-2 h-4 w-4" /></Button>
                    </Link>
                </div>
                 {trendingLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-96 rounded-lg" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {trendingListings?.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
                    </div>
                )}
            </section>
        </>
    )
}

function UnauthenticatedHomepageContent() {
    return (
        <section className="container mx-auto py-12 md:py-16">
            <Card className="text-center p-8 md:p-12">
                <CardHeader>
                    <CardTitle className="text-2xl md:text-3xl font-headline">Welcome to Nexus!</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-lg text-muted-foreground mb-6">Log in to see trending listings and featured students from your community.</p>
                    <Link href="/login">
                        <Button size="lg">
                            <LogIn className="mr-2 h-5 w-5" /> Login to Continue
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </section>
    );
}


export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-image');
  const { user, isUserLoading } = useUser();
  
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

      <ClientOnly>
        {isUserLoading ? (
            <div className="container mx-auto py-12 md:py-16">
                <Skeleton className="h-64 w-full" />
            </div>
        ) : user ? (
            <AuthenticatedHomepageContent />
        ) : (
            <UnauthenticatedHomepageContent />
        )}
      </ClientOnly>
    </div>
  );
}
