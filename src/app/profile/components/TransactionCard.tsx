"use client";

import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { Transaction, Listing, User } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

export function TransactionCard({ transaction, role }: { transaction: Transaction, role: 'buyer' | 'seller' }) {
    const firestore = useFirestore();

    // Fetch Listing
    const listingRef = useMemoFirebase(() => {
        if (!firestore || !transaction.listingId) return null;
        return doc(firestore, 'listings', transaction.listingId);
    }, [firestore, transaction.listingId]);

    const { data: listing, isLoading: isListingLoading } = useDoc<Listing>(listingRef);

    // Fetch Other Party (if role is buyer, fetch seller; if seller, fetch buyer)
    const otherPartyId = role === 'buyer' ? transaction.sellerId : transaction.buyerId;
    const otherPartyRef = useMemoFirebase(() => {
        if (!firestore || !otherPartyId) return null;
        return doc(firestore, 'users', otherPartyId);
    }, [firestore, otherPartyId]);

    const { data: otherParty, isLoading: isUserLoading } = useDoc<User>(otherPartyRef);

    if (isListingLoading || isUserLoading) {
        return <Skeleton className="h-24 w-full mb-4" />;
    }

    if (!listing) {
        return (
            <Card className="mb-4">
                <CardContent className="p-4 flex items-center justify-between">
                    <div>
                        <p className="font-semibold text-muted-foreground">Listing unavailable</p>
                        <p className="text-sm text-muted-foreground">{transaction.createdAt ? format(new Date(transaction.createdAt), 'PPP') : 'Unknown Date'}</p>
                    </div>
                    <Badge variant="outline">{transaction.status}</Badge>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="mb-4 overflow-hidden hover:shadow-md transition-shadow group">
            <CardContent className="p-0 flex h-24">
                <div className="relative w-24 h-full flex-shrink-0 bg-muted">
                    <Image
                        src={listing.images?.[0] || listing.mediaUrl || "https://picsum.photos/200"}
                        alt={listing.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
                <div className="p-3 flex-grow flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <Link href={`/marketplace/${listing.id}`} className="font-semibold hover:underline line-clamp-1 text-base">
                                {listing.title}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                                {role === 'buyer' ? 'Sold by ' : 'Bought by '}
                                <Link href={`/profile/${otherParty?.id}`} className="hover:underline font-medium text-foreground">
                                    {otherParty?.name || 'Unknown User'}
                                </Link>
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-lg">${listing.price}</p>
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'} className="text-[10px] px-2 h-5">
                                {transaction.status}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider border px-1.5 rounded">
                                {transaction.paymentMethod}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {transaction.createdAt ? format(new Date(transaction.createdAt), 'MMM d, yyyy') : ''}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
