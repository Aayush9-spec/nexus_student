"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, Check, Loader2 } from "lucide-react";

export function FollowButton({ targetUserId }: { targetUserId: string }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Mock initial followed state
  const [isFollowing, setIsFollowing] = useState(
    user?.following.includes(targetUserId) || false
  );

  const handleFollowToggle = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not Logged In",
        description: "You need to be logged in to follow users.",
      });
      return;
    }
    
    if (user.id === targetUserId) {
      toast({
        title: "Well this is awkward...",
        description: "You can't follow yourself!",
      });
      return;
    }

    setIsLoading(true);
    // Simulate API call
    await new Promise(res => setTimeout(res, 500));
    setIsFollowing(!isFollowing);
    setIsLoading(false);
    toast({
        title: isFollowing ? "Unfollowed" : "Followed!",
    });
  };

  if (!user || user.id === targetUserId) {
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
