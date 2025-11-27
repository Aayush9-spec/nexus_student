"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfileRedirectPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (user) {
                router.push(`/profile/${user.uid}`);
            } else {
                // Redirect to login or show a message
                // For now, let's redirect to home or a login page if it existed
                router.push('/');
            }
        }
    }, [user, loading, router]);

    return (
        <div className="container mx-auto py-8">
            <Skeleton className="h-[400px] w-full max-w-3xl mx-auto" />
        </div>
    );
}
