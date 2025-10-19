
export type User = {
  id: string; // This is the uid from Firebase Auth
  uid: string;
  name: string;
  email: string;
  college: string;
  verified: boolean;
  profilePictureUrl: string; // Renamed from profileImageURL to match frontend
  bio?: string;
  rating?: number;
  totalSales?: number;
  sellerLevel?: string;
  xpPoints?: number;
  badges?: string[];
  nexusCredits?: number;
  createdAt: string; // ISO string
  // Fields from old schema, kept for compatibility during transition
  role?: 'student' | 'admin';
  skills?: string[];
  following?: string[];
  followers?: string[];
};

export type ListingCategory = 'Physical Products' | 'Digital Products' | 'Services' | 'Community/Collaboration';

export const listingCategories: ListingCategory[] = ['Physical Products', 'Digital Products', 'Services', 'Community/Collaboration'];

export type Listing = {
  id: string; // This is the documentId from Firestore
  listingId: string;
  sellerId: string;
  seller?: User;
  title: string;
  description: string;
  category: ListingCategory;
  price: number;
  images: string[];
  mediaUrl: string; // Keep for compatibility
  mediaType: 'image' | 'video'; // Keep for compatibility
  isFeatured?: boolean;
  status: 'active' | 'sold' | 'deleted';
  views?: number;
  likes?: number;
  college: string; // Renamed from collegeTag
  createdAt: string; // ISO string
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
    id: string;
    reviewId: string;
    listingId: string; // Added this to link review to a listing
    sellerId: string;
    buyerId: string;
    reviewer?: User; // From previous schema
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
    id: string;
    transactionId: string;
    buyerId: string;
    sellerId: string;
    listingId: string;
    amount: number;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    paymentMethod: string;
    createdAt: string; // ISO string
};

    