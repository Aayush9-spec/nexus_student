"use client";

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, limit } from 'firebase/firestore';
import type { Review } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReviewCard } from '@/app/marketplace/[listingId]/components/ReviewCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Star } from 'lucide-react';

export function UserReviews({ userId }: { userId: string }) {
    const firestore = useFirestore();

    const reviewsQuery = useMemoFirebase(() => {
        if (!firestore || !userId) return null;
        return query(
            collection(firestore, 'reviews'),
            where('sellerId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(10)
        );
    }, [firestore, userId]);

    const { data: reviews, isLoading } = useCollection<Review>(reviewsQuery);

    if (isLoading) {
        return (
            <div className="space-y-4">
                <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
                    <Star className="h-6 w-6 text-yellow-500" /> Reviews
                </h2>
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
        );
    }

    if (!reviews || reviews.length === 0) {
        return (
            <div className="space-y-4">
                <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
                    <Star className="h-6 w-6 text-yellow-500" /> Reviews
                </h2>
                <Card className="bg-muted/50">
                    <CardContent className="p-8 text-center text-muted-foreground">
                        No reviews yet.
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-500" /> Reviews ({reviews.length})
            </h2>
            <div className="grid gap-4">
                {reviews.map(review => (
                    <ReviewCard key={review.id} review={review} />
                ))}
            </div>
        </div>
    );
}
