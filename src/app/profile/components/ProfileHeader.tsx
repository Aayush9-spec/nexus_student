import type { User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FollowButton } from "./FollowButton";
import { EditProfileDialog } from "./EditProfileDialog";


interface ProfileHeaderProps {
  user: User;
  isOwnProfile: boolean;
}

export function ProfileHeader({ user, isOwnProfile }: ProfileHeaderProps) {
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  };
  
  return (
    <div className="bg-card p-6 md:p-8 rounded-lg">
        <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="w-32 h-32 border-4 border-primary">
                <AvatarImage src={user.profilePictureUrl} alt={user.name} />
                <AvatarFallback className="text-4xl">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-grow text-center md:text-left">
                <h1 className="text-3xl font-bold font-headline">{user.name}</h1>
                <p className="text-lg text-muted-foreground">{user.college}</p>
                <div className="flex gap-4 mt-4 justify-center md:justify-start">
                    <div>
                        <p className="font-bold text-lg">{user.followers?.length || 0}</p>
                        <p className="text-sm text-muted-foreground">Followers</p>
                    </div>
                    <div>
                        <p className="font-bold text-lg">{user.following?.length || 0}</p>
                        <p className="text-sm text-muted-foreground">Following</p>
                    </div>
                </div>
            </div>
            <div className="md:ml-auto">
                {isOwnProfile ? <EditProfileDialog user={user} /> : <FollowButton targetUserId={user.id} />}
            </div>
        </div>
        <div className="mt-6 space-y-4 text-center md:text-left">
            {user.bio && <p className="text-foreground/80">{user.bio}</p>}
            {user.skills && user.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {user.skills.map(skill => (
                        <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
}
