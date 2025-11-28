"use client";

import type { User } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FollowButton } from "./FollowButton";
import { EditProfileDialog } from "./EditProfileDialog";
import { CheckCircle2, MapPin, Calendar, GraduationCap, Mail, Linkedin, Github, Twitter, Instagram, Globe, Award, Star, TrendingUp, Zap, ShieldCheck, MessageCircle, MoreVertical, Share2, Flag } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useFirestore } from "@/firebase";
import { addDoc, collection, query, where, getDocs, serverTimestamp } from "firebase/firestore";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface ProfileHeaderProps {
    user: User;
    isOwnProfile: boolean;
}

export function ProfileHeader({ user, isOwnProfile }: ProfileHeaderProps) {
    const router = useRouter();
    const { user: currentUser } = useAuth();
    const firestore = useFirestore();

    const getInitials = (name: string) => {
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0][0]}${names[names.length - 1][0]}`;
        }
        return name.substring(0, 2);
    };

    const handleMessage = async () => {
        if (!currentUser || !firestore) return;

        try {
            // Check for existing chat
            const chatsRef = collection(firestore, 'chats');
            const q = query(chatsRef, where('participants', 'array-contains', currentUser.id));
            const querySnapshot = await getDocs(q);

            let existingChatId = null;

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.participants.includes(user.id)) {
                    existingChatId = doc.id;
                }
            });

            if (existingChatId) {
                router.push(`/chat/${existingChatId}`);
                return;
            }

            // Create new chat
            const newChatRef = await addDoc(chatsRef, {
                participants: [currentUser.id, user.id],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                lastMessage: ''
            });

            router.push(`/chat/${newChatRef.id}`);

        } catch (error) {
            console.error("Error creating chat:", error);
        }
    };

    const { toast } = useToast();

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast({ title: "Profile link copied", description: "Share it with your friends!" });
    };

    const handleReport = () => {
        toast({ title: "User reported", description: "We have received your report and will investigate." });
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
                        {user.verified && (
                            <div className="absolute bottom-2 right-2 bg-background rounded-full p-1 shadow-md" title="Verified Student">
                                <CheckCircle2 className="w-6 h-6 text-blue-500" fill="currentColor" stroke="white" />
                            </div>
                        )}
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
                                {isOwnProfile ? (
                                    <EditProfileDialog user={user} />
                                ) : (
                                    <>
                                        <Button variant="outline" onClick={handleMessage}>
                                            <MessageCircle className="mr-2 h-4 w-4" />
                                            Message
                                        </Button>
                                        <FollowButton targetUserId={user.id} />
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={handleShare}>
                                                    <Share2 className="mr-2 h-4 w-4" /> Share Profile
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={handleReport} className="text-destructive focus:text-destructive">
                                                    <Flag className="mr-2 h-4 w-4" /> Report User
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </>
                                )}
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

                        <div className="flex flex-wrap gap-4 text-sm mt-2">
                            {user.rating && (
                                <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 rounded-full">
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                    <span className="font-semibold">{user.rating.toFixed(1)}</span>
                                    <span className="text-muted-foreground text-xs">Rating</span>
                                </div>
                            )}
                            {user.totalSales !== undefined && user.totalSales > 0 && (
                                <div className="flex items-center gap-1 text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                                    <TrendingUp className="w-3.5 h-3.5" />
                                    <span className="font-semibold">{user.totalSales}</span>
                                    <span className="text-muted-foreground text-xs">Sales</span>
                                </div>
                            )}
                            {user.xpPoints !== undefined && user.xpPoints > 0 && (
                                <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded-full">
                                    <Zap className="w-3.5 h-3.5" />
                                    <span className="font-semibold">{user.xpPoints}</span>
                                    <span className="text-muted-foreground text-xs">XP</span>
                                </div>
                            )}
                            {isOwnProfile && user.nexusCredits !== undefined && (
                                <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                                    <div className="w-3.5 h-3.5 rounded-full border-2 border-current flex items-center justify-center text-[8px] font-bold">N</div>
                                    <span className="font-semibold">{user.nexusCredits}</span>
                                    <span className="text-muted-foreground text-xs">Credits</span>
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

                        {user.badges && user.badges.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2 border-t border-dashed border-border/50 mt-2">
                                <span className="text-xs text-muted-foreground w-full uppercase tracking-wider font-semibold">Badges</span>
                                {user.badges.map(badge => (
                                    <div key={badge} className="flex items-center gap-1 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-300 px-2 py-1 rounded-md text-xs border border-amber-200 dark:border-amber-800">
                                        <ShieldCheck className="w-3 h-3" />
                                        {badge}
                                    </div>
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
