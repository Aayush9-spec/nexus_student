import type { User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FollowButton } from "./FollowButton";
import { EditProfileDialog } from "./EditProfileDialog";
import { CheckCircle2, MapPin, Calendar, GraduationCap, Mail, Linkedin, Github, Twitter, Instagram, Globe, Award, Star } from "lucide-react";
import { format } from "date-fns";

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
        <div className="relative group">
            {/* Banner */}
            <div className="h-48 md:h-64 rounded-t-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]" />
            </div>

            {/* Profile Content */}
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-b-xl p-6 md:p-8 -mt-2 relative z-10 shadow-xl">
                <div className="flex flex-col md:flex-row items-start gap-6">
                    {/* Avatar - overlapping banner */}
                    <div className="-mt-20 md:-mt-24 relative">
                        <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background shadow-2xl ring-2 ring-primary/20">
                            <AvatarImage src={user.profilePictureUrl} alt={user.name} className="object-cover" />
                            <AvatarFallback className="text-4xl bg-muted">{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div className="absolute bottom-2 right-2 bg-background rounded-full p-1 shadow-md">
                            <CheckCircle2 className="w-6 h-6 text-blue-500" fill="currentColor" stroke="white" />
                        </div>
                    </div>

                    <div className="flex-grow space-y-4 w-full">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold font-headline flex items-center gap-2">
                                    {user.name}
                                </h1>
                                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                                    <GraduationCap className="w-4 h-4" />
                                    <span>{user.college || "University Student"}</span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                {isOwnProfile ? <EditProfileDialog user={user} /> : <FollowButton targetUserId={user.id} />}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>Joined {user.createdAt ? format(new Date(user.createdAt), 'MMMM yyyy') : 'Recently'}</span>
                            </div>
                            {isOwnProfile && (
                                <div className="flex items-center gap-1">
                                    <Mail className="w-4 h-4" />
                                    <span>{user.email}</span>
                                </div>
                            )}
                            {user.sellerLevel && (
                                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                    <Award className="w-4 h-4" />
                                    <span className="font-medium">{user.sellerLevel} Seller</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-6 text-sm">
                            <div className="flex items-center gap-1">
                                <span className="font-bold text-lg">{user.followers?.length || 0}</span>
                                <span className="text-muted-foreground">Followers</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="font-bold text-lg">{user.following?.length || 0}</span>
                                <span className="text-muted-foreground">Following</span>
                            </div>
                        </div>

                        {user.bio && (
                            <p className="text-foreground/90 max-w-2xl leading-relaxed">
                                {user.bio}
                            </p>
                        )}

                        {user.skills && user.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                                {user.skills.map(skill => (
                                    <Badge key={skill} variant="secondary" className="px-3 py-1 hover:bg-secondary/80 transition-colors">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {user.socialLinks && (
                    <div className="flex gap-3 pt-4 border-t mt-4 justify-end">
                        {user.socialLinks.linkedin && (
                            <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#0077b5] transition-colors">
                                <Linkedin className="w-5 h-5" />
                            </a>
                        )}
                        {user.socialLinks.github && (
                            <a href={user.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                                <Github className="w-5 h-5" />
                            </a>
                        )}
                        {user.socialLinks.twitter && (
                            <a href={user.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#1DA1F2] transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                        )}
                        {user.socialLinks.instagram && (
                            <a href={user.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#E1306C] transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                        )}
                        {user.socialLinks.website && (
                            <a href={user.socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                                <Globe className="w-5 h-5" />
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
