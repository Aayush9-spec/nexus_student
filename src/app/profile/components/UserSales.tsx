"use client";

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import type { Transaction } from '@/lib/types';
import { TransactionCard } from './TransactionCard';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function UserSales({ userId }: { userId: string }) {
    const firestore = useFirestore();

    const salesQuery = useMemoFirebase(() => {
        if (!firestore || !userId) return null;
        return query(
            collection(firestore, 'transactions'),
            where('sellerId', '==', userId),
            orderBy('createdAt', 'desc')
        );
    }, [firestore, userId]);

    const { data: sales, isLoading, error } = useCollection<Transaction>(salesQuery);

    if (error) {
        return (
            <div className="space-y-4">
                <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-green-500" /> Sales History
                </h2>
                <Card className="bg-destructive/10 border-destructive/20">
                    <CardContent className="p-8 text-center text-destructive">
                        <p>Unable to load sales history.</p>
                        <p className="text-sm opacity-80 mt-1">{error.message}</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="space-y-4">
                <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-green-500" /> Sales History
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    if (!sales || sales.length === 0) {
        return (
            <div className="space-y-4">
                <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
                    <TrendingUp className="h-6 w-6 text-green-500" /> Sales History
                </h2>
                <Card className="bg-muted/50 border-dashed">
                    <CardContent className="p-12 text-center text-muted-foreground flex flex-col items-center gap-2">
                        <TrendingUp className="h-12 w-12 opacity-20" />
                        <p>No sales yet. Good luck!</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-green-500" /> Sales History ({sales.length})
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {sales.map(sale => (
                    <TransactionCard key={sale.id} transaction={sale} role="seller" />
                ))}
            </div>
        </div>
    );
}
