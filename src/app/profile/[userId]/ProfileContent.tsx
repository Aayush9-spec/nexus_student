"use client";

import React from 'react';
import { notFound } from 'next/navigation';
import { ProfileHeader } from "../components/ProfileHeader";
import { UserListings } from "../components/UserListings";
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserReviews } from "../components/UserReviews";
import { SavedListings } from "../components/SavedListings";
import { UserOrders } from "../components/UserOrders";
import { UserSales } from "../components/UserSales";

export function ProfileContent({ userId }: { userId: string }) {
    const firestore = useFirestore();
    const { user: currentUser, loading: isAuthLoading } = useAuth();

    const userRef = useMemoFirebase(() => {
        if (!firestore || !userId) return null;
        return doc(firestore, 'users', userId);
    }, [firestore, userId]);

    const { data: user, isLoading: isUserDocLoading } = useDoc<User>(userRef);

    if (isAuthLoading || isUserDocLoading) {
        return <ProfileSkeleton />;
    }

    if (!user) {
        notFound();
    }

    const isOwnProfile = currentUser?.uid === user.id;

    return (
        <div className="container mx-auto py-8">
            <div className="space-y-8">
                <ProfileHeader user={user} isOwnProfile={isOwnProfile} />

                <Tabs defaultValue="listings" className="w-full">
                    <TabsList className="w-full justify-start overflow-x-auto flex h-auto p-1 gap-1 bg-muted/50 rounded-lg">
                        <TabsTrigger value="listings" className="flex-1 min-w-[80px]">Listings</TabsTrigger>
                        <TabsTrigger value="reviews" className="flex-1 min-w-[80px]">Reviews</TabsTrigger>
                        {isOwnProfile && (
                            <>
                                <TabsTrigger value="saved" className="flex-1 min-w-[80px]">Saved</TabsTrigger>
                                <TabsTrigger value="orders" className="flex-1 min-w-[80px]">Orders</TabsTrigger>
                                <TabsTrigger value="sales" className="flex-1 min-w-[80px]">Sales</TabsTrigger>
                            </>
                        )}
                    </TabsList>
                    <TabsContent value="listings" className="mt-6">
                        <UserListings userId={user.id} />
                    </TabsContent>
                    <TabsContent value="reviews" className="mt-6">
                        <UserReviews userId={user.id} />
                    </TabsContent>
                    {isOwnProfile && (
                        <>
                            <TabsContent value="saved" className="mt-6">
                                <SavedListings savedListingIds={user.savedListingIds} />
                            </TabsContent>
                            <TabsContent value="orders" className="mt-6">
                                <UserOrders userId={user.id} />
                            </TabsContent>
                            <TabsContent value="sales" className="mt-6">
                                <UserSales userId={user.id} />
                            </TabsContent>
                        </>
                    )}
                </Tabs>
            </div>
        </div>
    );
}

export function ProfileSkeleton() {
    return (
        <div className="container mx-auto py-8">
            <div className="space-y-8">
                <div className="bg-card p-6 md:p-8 rounded-lg">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <Skeleton className="w-32 h-32 rounded-full" />
                        <div className="flex-grow text-center md:text-left space-y-3">
                            <Skeleton className="h-8 bg-muted rounded w-48 mx-auto md:mx-0" />
                            <Skeleton className="h-6 bg-muted rounded w-32 mx-auto md:mx-0" />
                            <div className="flex gap-4 mt-4 justify-center md:justify-start">
                                <div className="space-y-2"><Skeleton className="h-5 w-12" /><Skeleton className="h-4 w-20" /></div>
                                <div className="space-y-2"><Skeleton className="h-5 w-12" /><Skeleton className="h-4 w-20" /></div>
                            </div>
                        </div>
                        <Skeleton className="h-10 w-32" />
                    </div>
                    <div className="mt-6 space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <div className="flex flex-wrap gap-2 pt-2">
                            <Skeleton className="h-6 w-20 rounded-full" />
                            <Skeleton className="h-6 w-24 rounded-full" />
                            <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                    </div>
                </div>
                <div>
                    <Skeleton className="h-8 w-40 mb-6" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="bg-muted rounded-lg h-80" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
