

export type User = {
    id: string; // This is the uid from Firebase Auth
    uid: string;
    name: string;
    email: string;
    college: string;
    verified: boolean;
    profilePictureUrl: string;
    bio?: string;
    rating?: number;
    totalSales?: number;
    sellerLevel?: string;
    xpPoints?: number;
    badges?: string[];
    nexusCredits?: number;
    createdAt: string; // ISO string
    skills?: string[];
    following?: string[];
    followers?: string[];
    socialLinks?: {
        linkedin?: string;
        github?: string;
        twitter?: string;
        instagram?: string;
        website?: string;
    };
};

export type ListingCategory = 'Physical Products' | 'Digital Products' | 'Services' | 'Community/Collaboration';

export const listingCategories: ListingCategory[] = ['Physical Products', 'Digital Products', 'Services', 'Community/Collaboration'];

// Seller info is now denormalized onto the listing
export type ListingSeller = Pick<User, 'id' | 'name' | 'profilePictureUrl'>;

export type AddressComponent = {
    long_name: string;
    short_name: string;
    types: string[];
};

export type LocationDetails = {
    formatted_address: string;
    address_components: AddressComponent[];
    lat: number;
    lng: number;
};

export type Listing = {
    id: string; // This is the documentId from Firestore
    sellerId: string;
    seller: ListingSeller; // Denormalized seller info for efficient querying
    title: string;
    description: string;
    category: ListingCategory;
    price: number;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    isFeatured?: boolean;
    status: 'active' | 'sold' | 'deleted';
    views?: number;
    likes?: number;
    college: string;
    createdAt: string; // ISO string
    location?: LocationDetails;
};

export type Chat = {
    id: string;
    chatId: string;
    participants: string[];
    lastMessage?: string;
    updatedAt: string; // ISO string
};

export type Message = {
    id: string;
    messageId: string;
    senderId: string;
    text: string;
    timestamp: string; // ISO string
    isRead?: boolean;
};

export type Review = {
    id: string; // Firestore document ID
    listingId: string;
    sellerId: string;
    buyerId: string;
    reviewerId: string; // Should be the same as buyerId
    rating: number; // 1-5
    comment: string;
    createdAt: string; // ISO string
};

export type Event = {
    id: string;
    eventId: string;
    organizerId: string;
    title: string;
    description: string;
    location: string;
    price: number;
    ticketsAvailable: number;
    images: string[];
    startDate: string; // ISO string
    endDate: string; // ISO string
};

export type CommunityFeedPost = {
    id: string;
    postId: string;
    authorId: string;
    content: string;
    images?: string[];
    upvotes?: number;
    commentsCount?: number;
    collegeTag: string;
    createdAt: string; // ISO string
};

export type Report = {
    id: string;
    reportId: string;
    reportedUserId: string;
    reason: string;
    description?: string;
    status: 'pending' | 'reviewed' | 'resolved';
    createdAt: string; // ISO string
};

export type Transaction = {
    id: string; // Firestore document ID
    transactionId: string;
    buyerId: string;
    sellerId: string;
    listingId: string;
    amount: number;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    paymentMethod: string;
    createdAt: string; // ISO string
};

