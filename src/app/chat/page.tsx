"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, doc, getDoc, DocumentData } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare } from 'lucide-react';
import type { Chat, User } from '@/lib/types';

function ChatListItem({ chat, currentUserId }: { chat: Chat; currentUserId: string }) {
    const firestore = useFirestore();
    const [otherUser, setOtherUser] = useState<User | null>(null);

    const otherUserId = chat.participants.find(id => id !== currentUserId);

    useEffect(() => {
        async function fetchUser() {
            if (!firestore || !otherUserId) return;
            const userDoc = await getDoc(doc(firestore, 'users', otherUserId));
            if (userDoc.exists()) {
                setOtherUser({ id: userDoc.id, ...userDoc.data() } as User);
            }
        }
        fetchUser();
    }, [firestore, otherUserId]);

    const getInitials = (name?: string) => {
        if (!name) return 'U';
        return name.substring(0, 2).toUpperCase();
    };

    if (!otherUser) return <Skeleton className="h-20 w-full mb-2" />;

    return (
        <Link href={`/chat/${chat.id}`}>
            <Card className="hover:bg-accent/50 transition-colors mb-3 cursor-pointer">
                <CardContent className="p-4 flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={otherUser.profilePictureUrl} />
                        <AvatarFallback>{getInitials(otherUser.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                            <h3 className="font-semibold truncate">{otherUser.name}</h3>
                            {chat.updatedAt && (
                                <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                    {formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true })}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                            {chat.lastMessage || "Start a conversation"}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

export default function ChatListPage() {
    const { user, loading } = useAuth();
    const firestore = useFirestore();

    const chatsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(
            collection(firestore, 'chats'),
            where('participants', 'array-contains', user.id),
            orderBy('updatedAt', 'desc')
        );
    }, [firestore, user]);

    const { data: chats, isLoading } = useCollection<Chat>(chatsQuery);

    if (loading || isLoading) {
        return (
            <div className="container mx-auto py-8 max-w-2xl">
                <h1 className="text-3xl font-bold font-headline mb-6">Messages</h1>
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full mb-4" />
                ))}
            </div>
        );
    }

    if (!user) {
        return (
            <div className="container mx-auto py-16 text-center">
                <h2 className="text-2xl font-bold mb-4">Please log in to view messages</h2>
                <Link href="/login" className="text-primary hover:underline">Go to Login</Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 max-w-2xl">
            <h1 className="text-3xl font-bold font-headline mb-6 flex items-center gap-2">
                <MessageSquare className="h-8 w-8" /> Messages
            </h1>

            {chats && chats.length > 0 ? (
                <div className="space-y-2">
                    {chats.map(chat => (
                        <ChatListItem key={chat.id} chat={chat} currentUserId={user.id} />
                    ))}
                </div>
            ) : (
                <Card className="text-center py-12">
                    <CardContent>
                        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                        <h3 className="text-xl font-semibold mb-2">No messages yet</h3>
                        <p className="text-muted-foreground mb-6">
                            Contact a seller from the marketplace to start a conversation.
                        </p>
                        <Link href="/marketplace" className="text-primary hover:underline font-medium">
                            Browse Marketplace
                        </Link>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
