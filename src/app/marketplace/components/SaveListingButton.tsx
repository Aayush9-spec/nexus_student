"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Heart, Loader2 } from "lucide-react";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SaveListingButtonProps {
    listingId: string;
    className?: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
}

export function SaveListingButton({ listingId, className, variant = "ghost", size = "icon" }: SaveListingButtonProps) {
    const { user: currentUser } = useAuth();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const userRef = useMemoFirebase(() => {
        if (!firestore || !currentUser?.id) return null;
        return doc(firestore, 'users', currentUser.id);
    }, [firestore, currentUser?.id]);

    const { data: userData } = useDoc<User>(userRef);

    // Use userData if available, otherwise fall back to currentUser (which might be stale)
    const savedIds = userData?.savedListingIds || currentUser?.savedListingIds || [];
    const isSaved = savedIds.includes(listingId);

    const handleToggleSave = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating to listing details if inside a Link
        e.stopPropagation();

        if (!currentUser || !firestore) {
            toast({
                title: "Please log in",
                description: "You need to be logged in to save listings.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        const userDocRef = doc(firestore, "users", currentUser.id);

        try {
            if (isSaved) {
                await updateDoc(userDocRef, {
                    savedListingIds: arrayRemove(listingId)
                });
                toast({ description: "Removed from saved items." });
            } else {
                await updateDoc(userDocRef, {
                    savedListingIds: arrayUnion(listingId)
                });
                toast({ description: "Saved to your items!" });
            }
        } catch (error) {
            console.error("Error saving listing:", error);
            toast({
                title: "Error",
                description: "Could not update saved items.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            className={cn("rounded-full hover:bg-background/80 transition-colors z-10", className)}
            onClick={handleToggleSave}
            disabled={isLoading}
        >
            {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : (
                <Heart className={cn("h-5 w-5 transition-colors", isSaved ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-500")} />
            )}
            <span className="sr-only">{isSaved ? "Unsave" : "Save"}</span>
        </Button>
    );
}
