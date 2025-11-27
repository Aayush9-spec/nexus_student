"use client";

import { useEffect, useState, useRef } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, query, orderBy, addDoc, serverTimestamp, updateDoc, limit } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, ArrowLeft } from 'lucide-react';
import type { Chat, Message, User } from '@/lib/types';
import Link from 'next/link';

function ChatMessage({ message, isOwn }: { message: Message; isOwn: boolean }) {
    return (
        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
            <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${isOwn
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-muted text-foreground rounded-bl-none'
                    }`}
            >
                <p>{message.text}</p>
                <span className={`text-[10px] block mt-1 opacity-70 ${isOwn ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                    {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...'}
                </span>
            </div>
        </div>
    );
}

export function ChatContent({ chatId }: { chatId: string }) {
    const { user } = useAuth();
    const firestore = useFirestore();
    const router = useRouter();
    const [newMessage, setNewMessage] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const [otherUser, setOtherUser] = useState<User | null>(null);

    // 1. Fetch Chat Details
    const chatRef = useMemoFirebase(() => {
        if (!firestore || !chatId) return null;
        return doc(firestore, 'chats', chatId);
    }, [firestore, chatId]);

    const { data: chat, isLoading: isChatLoading } = useDoc<Chat>(chatRef);

    // 2. Fetch Messages
    const messagesQuery = useMemoFirebase(() => {
        if (!firestore || !chatId) return null;
        return query(
            collection(firestore, 'chats', chatId, 'messages'),
            orderBy('timestamp', 'asc'),
            limit(100)
        );
    }, [firestore, chatId]);

    const { data: messages, isLoading: isMessagesLoading } = useCollection<Message>(messagesQuery);

    // 3. Fetch Other User Details
    useEffect(() => {
        async function fetchOtherUser() {
            if (!firestore || !chat || !user) return;
            const otherUserId = chat.participants.find(id => id !== user.id);
            if (otherUserId) {
                // We can't use useDoc here easily inside useEffect, so we fetch once.
                // In a real app, we might want to subscribe to the user doc too.
                const { getDoc } = await import('firebase/firestore');
                const userDoc = await getDoc(doc(firestore, 'users', otherUserId));
                if (userDoc.exists()) {
                    setOtherUser({ id: userDoc.id, ...userDoc.data() } as User);
                }
            }
        }
        fetchOtherUser();
    }, [firestore, chat, user]);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !firestore || !chatId) return;

        const text = newMessage.trim();
        setNewMessage('');

        try {
            // Add message to subcollection
            await addDoc(collection(firestore, 'chats', chatId, 'messages'), {
                text,
                senderId: user.id,
                timestamp: serverTimestamp(), // This will be server time
                isRead: false,
            });

            // Update chat document with last message
            await updateDoc(doc(firestore, 'chats', chatId), {
                lastMessage: text,
                updatedAt: serverTimestamp(),
            });

        } catch (error) {
            console.error("Failed to send message:", error);
            // Ideally show a toast
        }
    };

    if (isChatLoading) return <div className="container mx-auto py-8"><Skeleton className="h-[500px] w-full" /></div>;

    if (!chat) return notFound();

    return (
        <div className="container mx-auto max-w-3xl py-6 h-[calc(100vh-4rem)] flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4 pb-4 border-b">
                <Link href="/chat">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                {otherUser ? (
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={otherUser.profilePictureUrl} />
                            <AvatarFallback>{otherUser.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="font-bold">{otherUser.name}</h2>
                            <p className="text-xs text-muted-foreground">{otherUser.college}</p>
                        </div>
                    </div>
                ) : (
                    <Skeleton className="h-10 w-40" />
                )}
            </div>

            {/* Messages Area */}
            <Card className="flex-1 overflow-hidden flex flex-col bg-slate-50 dark:bg-slate-950/50">
                <div className="flex-1 overflow-y-auto p-4">
                    {isMessagesLoading ? (
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-3/4 rounded-xl" />)}
                        </div>
                    ) : messages && messages.length > 0 ? (
                        messages.map((msg) => (
                            <ChatMessage
                                key={msg.id}
                                message={msg}
                                isOwn={msg.senderId === user?.id}
                            />
                        ))
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground">
                            <p>No messages yet. Say hello!</p>
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-background border-t">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1"
                        />
                        <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    );
}
