export type User = {
  id: string;
  name: string;
  email: string;
  college: string;
  bio?: string;
  skills?: string[];
  profilePictureUrl: string;
  role: 'student' | 'admin';
  following: string[];
  followers: string[];
};

export type ListingCategory = 'Physical Products' | 'Digital Products' | 'Services' | 'Community/Collaboration';

export const listingCategories: ListingCategory[] = ['Physical Products', 'Digital Products', 'Services', 'Community/Collaboration'];

export type Listing = {
  id: string;
  title: string;
  description:string;
  category: ListingCategory;
  price: number;
  mediaUrl: string; // Changed from mediaUrl?: string to be required and single
  sellerId: string;
  seller?: User;
  createdAt: string;
  college: string; // Added college field
};

export type Review = {
    id: string;
    listingId: string;
    reviewerId: string;
    reviewer?: User;
    rating: number; // 1-5
    comment: string;
    createdAt: string;
};
