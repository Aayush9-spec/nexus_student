"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, Check, Loader2 } from "lucide-react";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, updateDoc, arrayUnion, arrayRemove, runTransaction } from "firebase/firestore";
import type { User } from "@/lib/types";


export function FollowButton({ targetUserId }: { targetUserId: string }) {
  const { user: currentUser } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const currentUserRef = useMemoFirebase(() => {
    if (!firestore || !currentUser?.id) return null;
    return doc(firestore, 'users', currentUser.id);
  }, [firestore, currentUser?.id]);

  const { data: currentUserData } = useDoc<User>(currentUserRef);

  const isFollowing = currentUserData?.following?.includes(targetUserId) || false;

  const handleFollowToggle = async () => {
    if (!currentUser || !firestore) {
      toast({
        variant: "destructive",
        title: "Not Logged In",
        description: "You need to be logged in to follow users.",
      });
      return;
    }
    
    if (currentUser.id === targetUserId) {
      toast({
        title: "Well this is awkward...",
        description: "You can't follow yourself!",
      });
      return;
    }

    setIsLoading(true);

    const currentUserDocRef = doc(firestore, "users", currentUser.id);
    const targetUserDocRef = doc(firestore, "users", targetUserId);

    try {
      await runTransaction(firestore, async (transaction) => {
        if (isFollowing) {
          // Unfollow
          transaction.update(currentUserDocRef, { following: arrayRemove(targetUserId) });
          transaction.update(targetUserDocRef, { followers: arrayRemove(currentUser.id) });
        } else {
          // Follow
          transaction.update(currentUserDocRef, { following: arrayUnion(targetUserId) });
          transaction.update(targetUserDocRef, { followers: arrayUnion(currentUser.id) });
        }
      });

      toast({
        title: isFollowing ? "Unfollowed" : "Followed!",
      });

    } catch (error) {
       console.error("Follow/unfollow error:", error);
       toast({
         variant: "destructive",
         title: "Something went wrong",
         description: "Could not update follow status. Please try again.",
       });
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentUser || currentUser.id === targetUserId) {
    return null;
  }

  return (
    <Button onClick={handleFollowToggle} disabled={isLoading} className="w-28">
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <Check className="mr-2 h-4 w-4" /> Following
        </>
      ) : (
        <>
          <Plus className="mr-2 h-4 w-4" /> Follow
        </>
      )}
    </Button>
  );
}
