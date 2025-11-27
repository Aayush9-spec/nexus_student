
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

    const trendingQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'listings'), limit(4)) as Query<Listing>;
    }, [firestore]);
    const { data: trendingListings, isLoading: trendingLoading } = useCollection<Listing>(trendingQuery);

    return (
        <>
            <section className="container mx-auto py-12 md:py-16">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold">Trending Listings</h2>
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
                    <CardTitle className="text-2xl md:text-3xl">Welcome to Nexus!</CardTitle>
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
    // const user = null;
    // const isUserLoading = false;

    return (
        <div className="flex flex-col">
            <section className="relative w-full h-[60vh] md:h-[70vh] text-white overflow-hidden">
                {heroImage && (
                    <Image
                        src={heroImage.imageUrl}
                        alt={heroImage.description}
                        fill
                        className="object-cover animate-fade-in"
                        priority
                        data-ai-hint={heroImage.imageHint}
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
                <div className="relative h-full flex flex-col items-center justify-center text-center p-4 animate-slide-up">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80 bg-300% animate-gradient">
                        The Student-Powered Marketplace
                    </h1>
                    <p className="text-xl md:text-3xl mb-10 max-w-3xl drop-shadow-lg text-white/90 font-light">
                        Discover, buy, and sell goods, services, and skills within your campus community.
                    </p>
                    <div className="flex gap-4">
                        <Link href="/marketplace">
                            <Button size="lg" className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105">
                                Explore Marketplace <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </Link>
                        <Link href="/new-listing">
                            <Button variant="secondary" size="lg" className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105">
                                Sell Something
                            </Button>
                        </Link>
                    </div>
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
