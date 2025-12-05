"use client";

import { useEffect, useState } from 'react';
import { useFirestore } from '@/firebase';
import { doc, writeBatch } from 'firebase/firestore';
import { dummyUsers, dummyListings, dummyReviews, dummyTransactions } from '@/lib/dummy-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminSeedPage() {
    const firestore = useFirestore();
    const [status, setStatus] = useState<'idle' | 'seeding' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const seedDatabase = async () => {
        if (!firestore) return;

        try {
            setStatus('seeding');
            setMessage('Starting seed...');

            // We use batches to ensure atomicity, but batches have a limit of 500 ops.
            // We'll split if needed, but our dummy data is small so one batch might fit?
            // Users: 5
            // Listings: 17
            // Transactions: 2
            // Reviews: 2
            // Total: 26 ops. One batch is fine.

            const batch = writeBatch(firestore);

            setMessage('Adding users...');
            dummyUsers.forEach(user => {
                const ref = doc(firestore, 'users', user.id);
                batch.set(ref, user);
            });

            setMessage('Adding listings...');
            dummyListings.forEach(listing => {
                const ref = doc(firestore, 'listings', listing.id);
                batch.set(ref, listing);
            });

            setMessage('Adding transactions... (and reviews)');
            // Note: dummyTransactions has no 'id' in the object, but we need one for the doc.
            // In the dummy file it says: export const dummyTransactions: Omit<Transaction, 'id'>[]
            // Wait, looking at the file, they DO have transactionId inside the object.
            // Let's us that as the doc ID.
            dummyTransactions.forEach(trx => {
                // The dummy data structure for transaction has 'transactionId' property but maybe not 'id'.
                // Let's use transactionId as the doc ID.
                const ref = doc(firestore, 'transactions', trx.transactionId);
                // We add the 'id' field to match the type if needed, or just spreac.
                batch.set(ref, { ...trx, id: trx.transactionId });
            });

            // Reviews do not have an ID in the dummy file Omit<Review, 'id'>
            // We will generate one or use a consistent one based on index?
            // "dummyReviews"
            dummyReviews.forEach((review, index) => {
                const reviewId = `review_${index + 1}`;
                const ref = doc(firestore, 'reviews', reviewId);
                batch.set(ref, { ...review, id: reviewId });
            });

            setMessage('Committing batch...');
            await batch.commit();

            setStatus('success');
            setMessage('Database seeded successfully with updated images!');
        } catch (error) {
            console.error(error);
            setStatus('error');
            setMessage(`Error seeding: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    return (
        <div className="container mx-auto py-12 flex justify-center">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Admin Database Seeder</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                        This tool will overwrite your Firestore database with the latest dummy data,
                        fixing any broken image links.
                    </p>
                    <p className="text-sm text-yellow-600 bg-yellow-100 p-2 rounded dark:bg-yellow-900/30 dark:text-yellow-400">
                        Warning: This requires Firestore rules to be temporarily open!
                    </p>

                    {status === 'idle' && (
                        <Button onClick={seedDatabase} className="w-full">
                            Seed Database
                        </Button>
                    )}

                    {status === 'seeding' && (
                        <Button disabled className="w-full">Seeding...</Button>
                    )}

                    {status === 'success' && (
                        <div className="bg-green-100 text-green-700 p-4 rounded dark:bg-green-900/30 dark:text-green-400">
                            {message}
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="bg-red-100 text-red-700 p-4 rounded dark:bg-red-900/30 dark:text-red-400">
                            {message}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
