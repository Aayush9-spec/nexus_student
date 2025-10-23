'use client';

import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { collection, writeBatch, doc, getDocs } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { dummyUsers } from '@/lib/dummy-data';
import { dummyListings } from '@/lib/dummy-data';
import { Loader2, Database } from 'lucide-react';

export function SeedDatabaseButton() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const seedDatabase = async () => {
    if (!firestore) return;
    setIsLoading(true);

    try {
      // Check if collections are already populated
      const usersSnapshot = await getDocs(collection(firestore, 'users'));
      const listingsSnapshot = await getDocs(collection(firestore, 'listings'));
      if (!usersSnapshot.empty || !listingsSnapshot.empty) {
        toast({
          title: 'Database Already Seeded',
          description: 'Your Firestore collections already contain data.',
        });
        setIsLoading(false);
        return;
      }
      
      const batch = writeBatch(firestore);

      // Add users
      dummyUsers.forEach(user => {
        const userRef = doc(firestore, 'users', user.id);
        batch.set(userRef, user);
      });

      // Add listings
      dummyListings.forEach(listing => {
        const listingRef = doc(firestore, 'listings', listing.id);
        batch.set(listingRef, listing);
      });

      await batch.commit();

      toast({
        title: 'Database Seeded!',
        description: 'Dummy users and listings have been added to Firestore.',
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
