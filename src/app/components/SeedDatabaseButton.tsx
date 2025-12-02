
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Database } from 'lucide-react';

export function SeedDatabaseButton() {

  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const seedDatabase = async () => {
    setIsLoading(true);
    toast({ title: 'Clearing and seeding database...', description: 'Please wait.' });

    try {
      const response = await fetch('/api/seed', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to seed database');
      }

      toast({
        title: 'Database Seeded!',
        description: 'Dummy data loaded. Note: This does NOT create login accounts. Please Sign Up to log in.',
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
