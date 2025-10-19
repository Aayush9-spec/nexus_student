'use client';

import type { Review as ReviewType, User } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { doc } from 'firebase/firestore';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';

function getInitials(name?: string) {
  if (!name) return '';
  const names = name.split(' ');
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`;
  }
  return name.substring(0, 2);
}

export function ReviewCard({ review }: { review: ReviewType }) {
  const firestore = useFirestore();

  const reviewerRef = useMemoFirebase(() => {
    if (!firestore || !review.reviewerId) return null;
    return doc(firestore, 'users', review.reviewerId);
  }, [firestore, review.reviewerId]);

  const { data: reviewer, isLoading } = useDoc<User>(reviewerRef);

  if (isLoading || !reviewer) {
    return (
        <Card>
            <CardContent className="p-4 flex gap-4 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-muted"></div>
                <div className="space-y-2">
                    <div className="h-4 bg-muted w-32 rounded"></div>
                    <div className="h-4 bg-muted w-48 rounded"></div>
                </div>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4 flex gap-4">
        <Avatar>
          <AvatarImage src={reviewer.profilePictureUrl} />
          <AvatarFallback>{getInitials(reviewer.name)}</AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold">{reviewer.name}</p>
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < review.rating ? 'fill-primary text-primary' : 'fill-muted stroke-muted-foreground'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-muted-foreground">{review.comment}</p>
        </div>
      </CardContent>
    </Card>
  );
}

    