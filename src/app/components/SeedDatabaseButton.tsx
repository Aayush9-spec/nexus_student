
'use client';

import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { collection, writeBatch, doc, getDocs, deleteDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { dummyUsers, dummyListings, dummyTransactions, dummyReviews } from '@/lib/dummy-data';
import { Loader2, Database } from 'lucide-react';

export function SeedDatabaseButton() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const seedDatabase = async () => {
    if (!firestore) return;
    setIsLoading(true);
    toast({ title: 'Clearing and seeding database...', description: 'Please wait.' });

    try {
      const batch = writeBatch(firestore);

      // Clear existing listings
      const listingsSnapshot = await getDocs(collection(firestore, 'listings'));
      listingsSnapshot.forEach(doc => batch.delete(doc.ref));
      
      // Clear existing users
      const usersSnapshot = await getDocs(collection(firestore, 'users'));
      usersSnapshot.forEach(doc => batch.delete(doc.ref));

      // Add new users
      dummyUsers.forEach(user => {
        const userRef = doc(firestore, 'users', user.id);
        batch.set(userRef, user);
      });

      // Add new listings
      dummyListings.forEach(listing => {
        // Use the listing 'id' field for the document ID
        const listingRef = doc(firestore, 'listings', listing.id);
        batch.set(listingRef, listing);
      });

      await batch.commit();

      toast({
        title: 'Database Seeded!',
        description: 'Dummy data has been successfully loaded into Firestore.',
      });

    } catch (error) {
      console.error('Error seeding database:', error);
      toast({
        variant: 'destructive',
        title: 'Seeding Failed',
        description: error instanceof Error ? error.message : 'Could not seed the database.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={seedDatabase} disabled={isLoading} variant="outline" size="sm">
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Database className="mr-2 h-4 w-4" />
      )}
      Seed DB
    </Button>
  );
}
