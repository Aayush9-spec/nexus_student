"use client";

import Image from 'next/image';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MapPin, Sparkles, AlertCircle, ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { useDoc, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, where, Query as FirestoreQuery, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import type { Listing, User, Review as ReviewType } from '@/lib/types';
import { useMemo, useState, useEffect } from 'react';
import { AddReviewForm } from './components/AddReviewForm';
import { ReviewCard } from './components/ReviewCard';
import { SaveListingButton } from '../components/SaveListingButton';
import { useAuth } from '@/hooks/use-auth';
import { analyzeListing, AnalyzeListingOutput } from '@/ai/flows/analyze-listing';
import { Skeleton } from '@/components/ui/skeleton';

function AiAnalysisCard({ listing }: { listing: Listing }) {
    const [analysis, setAnalysis] = useState<AnalyzeListingOutput | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function getAnalysis() {
            try {
                setIsLoading(true);
                setError(null);
                const result = await analyzeListing({
                    title: listing.title,
                    description: listing.description,
                    price: listing.price,
                    category: listing.category,
                });
                setAnalysis(result);
            } catch (e) {
                setError("Couldn't generate AI analysis.");
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        }
        getAnalysis();
    }, [listing]);

    const valueScoreColor = {
        'Great Deal': 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900/50',
        'Good Deal': 'text-emerald-600 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/50',
        'Fair Price': 'text-blue-600 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/50',
        'A bit pricey': 'text-amber-600 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/50',
        'Overpriced': 'text-red-600 bg-red-100 dark:text-red-300 dark:bg-red-900/50',
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg"><Sparkles className="text-primary h-5 w-5" /> AI Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex justify-between items-center pt-2">
                        <Skeleton className="h-6 w-24 rounded-full" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (error || !analysis) {
        return (
            <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg text-destructive"><AlertCircle className="h-5 w-5" /> AI Analysis Failed</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-destructive">{error}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-accent/20 border-accent">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-headline"><Sparkles className="text-primary h-5 w-5" /> AI Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="italic text-foreground/80">&quot;{analysis.summary}&quot;</p>
                <div className="flex justify-between items-center gap-4">
                    <Badge className={`text-base ${valueScoreColor[analysis.valueScore]}`}>{analysis.valueScore}</Badge>
                    <p className="text-sm text-muted-foreground text-right">{analysis.priceAnalysis}</p>
                </div>
            </CardContent>
        </Card>
    )
}

export function ListingDetailContent({ listingId }: { listingId: string }) {
    const firestore = useFirestore();
    const { user: currentUser } = useAuth();
    const router = useRouter();

    const handleContactSeller = async () => {
        if (!currentUser || !firestore || !listing) return;

        try {
            // Check for existing chat
            const chatsRef = collection(firestore, 'chats');
            const q = query(chatsRef, where('participants', 'array-contains', currentUser.id));
            const querySnapshot = await getDocs(q);

            let existingChatId = null;

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.participants.includes(listing.sellerId)) {
                    existingChatId = doc.id;
                }
            });

            if (existingChatId) {
                router.push(`/chat/${existingChatId}`);
                return;
            }

            // Create new chat
            const newChatRef = await addDoc(chatsRef, {
                participants: [currentUser.id, listing.sellerId],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                lastMessage: ''
            });

            router.push(`/chat/${newChatRef.id}`);

        } catch (error) {
            console.error("Error creating chat:", error);
        }
    };

    const listingRef = useMemoFirebase(() => {
        if (!firestore || !listingId) return null;
        return doc(firestore, 'listings', listingId);
    }, [firestore, listingId]);

    const { data: listing, isLoading: isLoadingListing } = useDoc<Listing>(listingRef);

    const sellerRef = useMemoFirebase(() => {
        if (!firestore || !listing?.sellerId) return null;
        return doc(firestore, 'users', listing.sellerId);
    }, [firestore, listing?.sellerId]);

    const { data: seller, isLoading: isLoadingSeller } = useDoc<User>(sellerRef);

    const reviewsQuery = useMemoFirebase(() => {
        if (!firestore || !listingId) return null;
        return query(collection(firestore, 'reviews'), where('listingId', '==', listingId)) as FirestoreQuery<ReviewType>;
    }, [firestore, listingId]);

    const { data: reviews, isLoading: isLoadingReviews } = useCollection<ReviewType>(reviewsQuery);

    const getInitials = (name?: string) => {
        if (!name) return '';
        const names = name.split(' ');
        if (names.length > 1) {
            return `${names[0][0]}${names[names.length - 1][0]}`;
        }
        return name.substring(0, 2);
    };

    const hasUserReviewed = useMemo(() => {
        if (!currentUser || !reviews) return false;
        return reviews.some(review => review.reviewerId === currentUser.id);
    }, [currentUser, reviews]);

    if (isLoadingListing || isLoadingSeller || isLoadingReviews) {
        return (
            <div className="container mx-auto py-8">
                <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
                    <div className="md:col-span-2 space-y-4">
                        <Skeleton className="aspect-video w-full rounded-lg" />
                        <Skeleton className="h-10 w-3/4 rounded-md" />
                        <Skeleton className="h-6 w-1/2 rounded-md" />
                        <div className="space-y-2 mt-4">
                            <Skeleton className="h-4 w-full rounded-md" />
                            <Skeleton className="h-4 w-full rounded-md" />
                            <Skeleton className="h-4 w-5/6 rounded-md" />
                        </div>
                    </div>
                    <div className="md:col-span-1 space-y-4">
                        <Skeleton className="rounded-lg h-64" />
                        <Skeleton className="rounded-lg h-48" />
                    </div>
                </div>
            </div>
        )
    }

    if (!listing) {
        notFound();
    }

    const canAddReview = currentUser && currentUser.id !== listing.sellerId && !hasUserReviewed;
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const images = listing.images && listing.images.length > 0 ? listing.images : [listing.mediaUrl];

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const { addItem } = useCart();
    const { toast } = useToast();

    const handleAddToCart = () => {
        if (!listing) return;
        addItem({
            id: listing.id,
            title: listing.title,
            price: listing.price,
            image: listing.images && listing.images.length > 0 ? listing.images[0] : listing.mediaUrl,
            quantity: 1,
            sellerId: listing.sellerId
        });
        toast({
            title: "Added to cart",
            description: `${listing.title} has been added to your cart.`,
        });
    };

    return (
        <div className="container mx-auto py-8">
            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
                <div className="md:col-span-2">
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg mb-4 bg-muted group">
                        {listing.mediaType === 'video' ? (
                            <video
                                src={listing.mediaUrl}
                                controls
                                className="w-full h-full object-cover"
                            >
                                Your browser does not support the video tag.
                            </video>
                        ) : (
                            <>
                                <Image
                                    src={images[currentImageIndex] || "https://picsum.photos/seed/placeholder/800/600"}
                                    alt={listing.title}
                                    fill
                                    className="object-cover"
                                    data-ai-hint="product image"
                                />
                                {images.length > 1 && (
                                    <>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={prevImage}
                                        >
                                            <ChevronLeft className="h-6 w-6" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={nextImage}
                                        >
                                            <ChevronRight className="h-6 w-6" />
                                        </Button>
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                            {images.map((_, index) => (
                                                <div
                                                    key={index}
                                                    className={`h-2 w-2 rounded-full transition-colors ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </>
                        )}
                    </div>
                    <div className="flex justify-between items-start gap-4">
                        <h1 className="text-3xl md:text-4xl font-bold font-headline mb-2">{listing.title}</h1>
                        <SaveListingButton listingId={listing.id} variant="outline" />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary">{listing.category}</Badge>
                        {listing.college && (
                            <Badge variant="outline" className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {listing.college}
                            </Badge>
                        )}
                    </div>
                    <p className="text-lg mt-4 text-foreground/80">{listing.description}</p>
                </div>
                <div className="md:col-span-1 space-y-6">
                    <Card className="sticky top-24">
                        <CardHeader>
                            <CardTitle className="text-4xl font-headline text-primary">
                                {listing.price > 0 ? <><span className="font-sans">₹</span>{listing.price.toFixed(2)}</> : 'Free'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button
                                size="lg"
                                className="w-full"
                                disabled={listing.status === 'sold' || !currentUser || currentUser.id === listing.sellerId}
                                onClick={handleContactSeller}
                            >
                                {listing.status === 'sold' ? 'Sold Out' : (currentUser?.id === listing.sellerId ? 'Your Listing' : 'Contact Seller')}
                            </Button>
                            <Button
                                size="lg"
                                className="w-full"
                                variant="secondary"
                                disabled={listing.status === 'sold' || !currentUser || currentUser.id === listing.sellerId}
                                onClick={handleAddToCart}
                            >
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Add to Cart
                            </Button>
                            {seller && (
                                <>
                                    <Separator />
                                    <Link href={`/profile/${seller.id}`}>
                                        <div className="flex items-center gap-4 text-sm text-foreground hover:bg-muted p-2 rounded-md">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={seller.profilePictureUrl} alt={seller.name} />
                                                <AvatarFallback>{getInitials(seller.name)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold">Sold by {seller.name}</p>
                                                <p className="text-muted-foreground">{seller.college}</p>
                                            </div>
                                        </div>
                                    </Link>
                                </>
                            )}
                        </CardContent>
                    </Card>
                    <AiAnalysisCard listing={listing} />
                </div>
            </div>

            <Separator className="my-12" />

            <div>
                <h2 className="text-2xl font-bold font-headline mb-6">Reviews ({reviews?.length || 0})</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        {reviews && reviews.length > 0 ? (
                            reviews.map(review => (
                                <ReviewCard key={review.id} review={review} />
                            ))
                        ) : (
                            <div className="text-center text-muted-foreground py-8">
                                <p>No reviews yet for this listing. Be the first!</p>
                            </div>
                        )}
                    </div>
                    <div>
                        {canAddReview ? (
                            <AddReviewForm listing={listing} />
                        ) : (
                            <Card className="bg-muted p-4 text-center">
                                <p className="text-sm text-muted-foreground">
                                    {!currentUser ? "You must be logged in to leave a review."
                                        : currentUser.id === listing.sellerId ? "You cannot review your own listing."
                                            : hasUserReviewed ? "You have already reviewed this listing."
                                                : "You are not eligible to review this item."
                                    }
                                </p>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
