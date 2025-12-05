
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
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
            <section className="container mx-auto py-16 md:py-24 relative">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/5 to-transparent -z-10 pointer-events-none" />
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">Trending Listings</h2>
                        <p className="text-muted-foreground mt-2 text-lg">See what's popular in your campus community today.</p>
                    </div>
                    <Link href="/marketplace">
                        <Button variant="ghost" className="group text-primary hover:text-primary/80 hover:bg-primary/10 text-lg">
                            View All Listings <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </Button>
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
        <section className="container mx-auto py-16 md:py-24 flex justify-center">
            <Card className="text-center p-10 md:p-16 max-w-3xl w-full backdrop-blur-md bg-card/40 border-primary/10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-purple-500 to-primary animate-gradient bg-200%" />
                <CardHeader className="pb-4">
                    <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-6">
                        <LogIn className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle className="text-3xl md:text-5xl font-bold tracking-tight">Welcome to Nexus!</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-lg mx-auto">
                        Join your campus marketplace to see trending listings, connect with students, and trade securely.
                    </p>
                    <Link href="/login">
                        <Button size="lg" className="text-lg px-10 py-6 rounded-full shadow-lg hover:shadow-primary/25 transition-all hover:scale-105">
                            Login to Continue <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </section>
    );
}


export default function Home() {
    const { user, isUserLoading } = useUser();
    // const user = null;
    // const isUserLoading = false;

    return (
        <div className="flex flex-col">
            <section className="relative w-full h-[65vh] md:h-[75vh] text-white overflow-hidden flex items-center justify-center">
                <Image
                    src="/images/hero-main.png"
                    alt="Nexus Student Marketplace - Connect, Trade, Collaborate"
                    fill
                    className="object-cover animate-fade-in"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background" />

                <div className="relative z-10 flex flex-col items-center justify-center text-center p-6 max-w-5xl mx-auto animate-slide-up">
                    <div className="backdrop-blur-sm bg-black/20 p-8 md:p-12 rounded-3xl border border-white/10 shadow-2xl">
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-200 to-white bg-300% animate-gradient drop-shadow-sm">
                            The Student-Powered Marketplace
                        </h1>
                        <p className="text-xl md:text-3xl mb-10 text-gray-100 font-light leading-relaxed drop-shadow-md max-w-3xl mx-auto">
                            Discover, buy, and sell goods, services, and skills within your campus community.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-5 justify-center">
                            <Link href="/marketplace">
                                <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-7 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)] hover:shadow-[0_0_30px_rgba(99,102,241,0.8)] transition-all hover:scale-105 bg-primary hover:bg-primary/90 border-none">
                                    Explore Marketplace <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                            </Link>
                            <Link href="/new-listing">
                                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-7 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border-white/30 hover:border-white/50">
                                    Sell Something
                                </Button>
                            </Link>
                        </div>
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
