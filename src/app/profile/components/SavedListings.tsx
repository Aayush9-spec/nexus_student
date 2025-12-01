"use client";

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, documentId } from 'firebase/firestore';
import type { Listing } from '@/lib/types';
import { ListingGrid } from "@/app/marketplace/components/ListingGrid";
import { Card, CardContent } from '@/components/ui/card';
import { Heart } from 'lucide-react';

export function SavedListings({ savedListingIds }: { savedListingIds?: string[] }) {
    const firestore = useFirestore();

    const listingsQuery = useMemoFirebase(() => {
        if (!firestore || !savedListingIds || savedListingIds.length === 0) return null;
        // Firestore 'in' query is limited to 10 items. 
        // For a real app, we'd need to handle this better (e.g. multiple queries or client-side filtering if feasible).
        // For now, let's just take the first 10.
        const idsToFetch = savedListingIds.slice(0, 10);
        return query(collection(firestore, 'listings'), where(documentId(), 'in', idsToFetch));
    }, [firestore, savedListingIds]);

    const { data: savedListings, isLoading, error } = useCollection<Listing>(listingsQuery);

    if (error) {
        return (
            <div className="space-y-4">
                <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
                    <Heart className="h-6 w-6 text-red-500" /> Saved Items
                </h2>
                <Card className="bg-destructive/10 border-destructive/20">
                    <CardContent className="p-8 text-center text-destructive">
                        <p>Unable to load saved items.</p>
                        <p className="text-sm opacity-80 mt-1">{error.message}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!savedListingIds || savedListingIds.length === 0) {
        return (
            <div className="space-y-4">
                <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
                    <Heart className="h-6 w-6 text-red-500" /> Saved Items
                </h2>
                <Card className="bg-muted/50">
                    <CardContent className="p-8 text-center text-muted-foreground">
                        You haven't saved any items yet.
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
                <Heart className="h-6 w-6 text-red-500" /> Saved Items ({savedListingIds.length})
            </h2>
            <ListingGrid listings={savedListings || []} isLoading={isLoading} />
            {savedListingIds.length > 10 && (
                <p className="text-center text-muted-foreground text-sm">
                    Showing 10 of {savedListingIds.length} saved items.
                </p>
            )}
        </div>
    );
}
