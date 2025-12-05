import { NextResponse } from 'next/server';
import { adminFirestore } from '@/lib/firebase-admin';
import { dummyUsers, dummyListings } from '@/lib/dummy-data';

export async function POST() {
    try {
        const db = adminFirestore();
        if (!db) {
            return NextResponse.json(
                { error: 'Firebase Admin not initialized. Check server logs for missing credentials.' },
                { status: 500 }
            );
        }

        const batch = db.batch();

        // Clear existing listings
        const listingsSnapshot = await db.collection('listings').get();
        listingsSnapshot.forEach((doc: any) => {
            batch.delete(doc.ref);
        });

        // Clear existing users
        const usersSnapshot = await db.collection('users').get();
        usersSnapshot.forEach((doc: any) => {
            batch.delete(doc.ref);
        });

        // Add new users
        dummyUsers.forEach((user) => {
            const userRef = db.collection('users').doc(user.id);
            batch.set(userRef, user);
        });

        // Add new listings
        dummyListings.forEach((listing) => {
            const listingRef = db.collection('listings').doc(listing.id);
            batch.set(listingRef, listing);
        });

        await batch.commit();

        return NextResponse.json({ message: 'Database seeded successfully' });
    } catch (error) {
        console.error('Error seeding database:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
