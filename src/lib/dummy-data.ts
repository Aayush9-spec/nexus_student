
import type { User, Listing, ListingSeller, Review, Transaction, LocationDetails } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const findImage = (id: string) => PlaceHolderImages.find(img => img.id === id)?.imageUrl || '';

export const dummyUsers: User[] = [
  {
    id: 'user_1',
    uid: 'user_1',
    name: 'Priya Sharma',
    email: 'priya@iitb.ac.in',
    college: 'IIT Bombay',
    verified: true,
    profilePictureUrl: findImage('user-1') || "https://picsum.photos/seed/user1/200",
    bio: 'Budding software engineer and ML enthusiast. Selling my old engineering books and notes. Let\'s connect!',
    skills: ['Python', 'C++', 'Machine Learning', 'Data Structures'],
    following: ['user_2'],
    followers: ['user_3', 'user_2'],
    createdAt: new Date().toISOString(),
    rating: 4.8,
    totalSales: 16,
    sellerLevel: 'Gold',
    xpPoints: 1350,
    badges: ['Top Seller', 'Quick Responder'],
    nexusCredits: 150,
  },
  {
    id: 'user_2',
    uid: 'user_2',
    name: 'Rohan Mehta',
    email: 'rohan@christuniversity.in',
    college: 'Christ University, Bangalore',
    verified: true,
    profilePictureUrl: findImage('user-2') || "https://picsum.photos/seed/user2/200",
    bio: 'BBA student with a passion for marketing and graphic design. Offering freelance design services for college fests and events.',
    skills: ['Graphic Design', 'Canva', 'Social Media Marketing'],
    following: ['user_1'],
    followers: ['user_1', 'user_3'],
    createdAt: new Date().toISOString(),
    rating: 4.9,
    totalSales: 26,
    sellerLevel: 'Platinum',
    xpPoints: 2200,
    badges: ['Creative Pro', 'Community Helper'],
    nexusCredits: 220,
  },
  {
    id: 'user_3',
    uid: 'user_3',
    name: 'Ananya Singh',
    email: 'ananya@du.ac.in',
    college: 'Delhi University',
    verified: true,
    profilePictureUrl: findImage('user-3') || "https://picsum.photos/seed/user3/200",
    bio: 'Aspiring journalist and avid reader. Selling curated bundles of pre-loved novels and providing proofreading services.',
    skills: ['Writing', 'Editing', 'Content Creation'],
    following: ['user_1', 'user_2'],
    followers: [],
    createdAt: new Date().toISOString(),
    rating: 4.7,
    totalSales: 32,
    sellerLevel: 'Gold',
    xpPoints: 1950,
    badges: ['Bookworm', 'Top Reviewer'],
    nexusCredits: 175,
  },
  {
    id: 'user_4',
    uid: 'user_4',
    name: 'Vikram Reddy',
    email: 'vikram@iitm.ac.in',
    college: 'IIT Madras',
    verified: true,
    profilePictureUrl: findImage('user-4') || "https://picsum.photos/seed/user4/200",
    bio: 'Mechanical engineer and robotics geek. Selling old components and offering CAD tutoring.',
    skills: ['AutoCAD', 'SolidWorks', 'Robotics'],
    following: [],
    followers: [],
    createdAt: new Date().toISOString(),
    rating: 4.6,
    totalSales: 8,
    sellerLevel: 'Silver',
    xpPoints: 800,
    badges: ['Tech Guru'],
    nexusCredits: 75,
  },
  {
    id: 'user_5',
    uid: 'user_5',
    name: 'Sneha Rao',
    email: 'sneha@nift.ac.in',
    college: 'NIFT Delhi',
    verified: true,
    profilePictureUrl: findImage('user-5') || "https://picsum.photos/seed/user5/200",
    bio: 'Fashion design student. Selling custom sketches and thrifted clothing.',
    skills: ['Fashion Design', 'Sketching', 'Thrifting'],
    following: [],
    followers: [],
    createdAt: new Date().toISOString(),
    rating: 4.8,
    totalSales: 12,
    sellerLevel: 'Silver',
    xpPoints: 1100,
    badges: ['Fashionista'],
    nexusCredits: 110,
  }
];

const iitBombayLocation: LocationDetails = {
    "formatted_address": "IIT Bombay, Main Gate Road, IIT Area, Powai, Mumbai, Maharashtra 400076, India",
    "address_components": [
        { "long_name": "Indian Institute of Technology Bombay", "short_name": "IIT Bombay", "types": ["establishment", "point_of_interest", "university"] },
        { "long_name": "Powai", "short_name": "Powai", "types": ["political", "sublocality", "sublocality_level_1"] },
        { "long_name": "Mumbai", "short_name": "Mumbai", "types": ["locality", "political"] },
        { "long_name": "Mumbai Suburban", "short_name": "Mumbai Suburban", "types": ["administrative_area_level_2", "political"] },
        { "long_name": "Maharashtra", "short_name": "MH", "types": ["administrative_area_level_1", "political"] },
        { "long_name": "India", "short_name": "IN", "types": ["country", "political"] },
        { "long_name": "400076", "short_name": "400076", "types": ["postal_code"] }
    ],
    "lat": 19.1332353,
    "lng": 72.9134939
};

const christUniLocation: LocationDetails = {
    "formatted_address": "Christ University, Hosur Road, Bhavani Nagar, S.G. Palya, Bengaluru, Karnataka 560029, India",
    "address_components": [
      { "long_name": "Christ University", "short_name": "Christ University", "types": ["establishment", "point_of_interest", "university"] },
      { "long_name": "Bhavani Nagar", "short_name": "Bhavani Nagar", "types": ["political", "sublocality", "sublocality_level_2"] },
      { "long_name": "S.G. Palya", "short_name": "S.G. Palya", "types": ["political", "sublocality", "sublocality_level_1"] },
      { "long_name": "Bengaluru", "short_name": "Bengaluru", "types": ["locality", "political"] },
      { "long_name": "Bangalore Urban", "short_name": "Bangalore Urban", "types": ["administrative_area_level_2", "political"] },
      { "long_name": "Karnataka", "short_name": "KA", "types": ["administrative_area_level_1", "political"] },
      { "long_name": "India", "short_name": "IN", "types": ["country", "political"] },
      { "long_name": "560029", "short_name": "560029", "types": ["postal_code"] }
    ],
    "lat": 12.9343698,
    "lng": 77.6045959
};

const duLocation: LocationDetails = {
    "formatted_address": "University of Delhi, Sudhir Bose Marg, University Area, New Delhi, Delhi 110007, India",
    "address_components": [
        { "long_name": "University of Delhi", "short_name": "University of Delhi", "types": ["establishment", "point_of_interest", "university"] },
        { "long_name": "University Area", "short_name": "University Area", "types": ["political", "sublocality", "sublocality_level_1"] },
        { "long_name": "New Delhi", "short_name": "New Delhi", "types": ["locality", "political"] },
        { "long_name": "New Delhi", "short_name": "New Delhi", "types": ["administrative_area_level_2", "political"] },
        { "long_name": "Delhi", "short_name": "DL", "types": ["administrative_area_level_1", "political"] },
        { "long_name": "India", "short_name": "IN", "types": ["country", "political"] },
        { "long_name": "110007", "short_name": "110007", "types": ["postal_code"] }
    ],
    "lat": 28.6872147,
    "lng": 77.208151
};

// Helper to create denormalized seller objects
const getListingSeller = (userId: string): ListingSeller => {
    const user = dummyUsers.find(u => u.id === userId);
    if (!user) throw new Error(`User not found for ID: ${userId}`);
    return {
        id: user.id,
        name: user.name,
        profilePictureUrl: user.profilePictureUrl
    };
};


export const dummyListings: Listing[] = [
  {
    id: 'listing_1',
    title: 'GATE CSE Digital Preparation Notes',
    description: 'Comprehensive and well-organized digital notes for all Computer Science subjects for the GATE exam. Includes solved previous year papers.',
    category: 'Digital Products',
    price: 499.00,
    mediaUrl: findImage('listing-gate-notes') || "https://picsum.photos/seed/listing1/600/400",
    mediaType: 'image',
    sellerId: 'user_1',
    seller: getListingSeller('user_1'),
    status: 'active',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    college: 'IIT Bombay',
    location: iitBombayLocation,
  },
  {
    id: 'listing_2',
    title: 'Graphic Design for College Fests',
    description: 'Need posters, social media posts, or logos for your college event? I provide professional design services at student-friendly prices. Contact for a quote.',
    category: 'Services',
    price: 999.00,
    mediaUrl: findImage('listing-fest-design') || "https://picsum.photos/seed/listing2/600/400",
    mediaType: 'image',
    sellerId: 'user_2',
    seller: getListingSeller('user_2'),
    status: 'active',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    college: 'Christ University, Bangalore',
    location: christUniLocation,
  },
  {
    id: 'listing_3',
    title: 'Gently Used Engineering Textbooks (1st Year)',
    description: 'Complete set of first-year engineering textbooks for CSE. Includes books for Physics, Chemistry, Maths, and C++. All in excellent condition.',
    category: 'Physical Products',
    price: 1500.00,
    mediaUrl: findImage('listing-engg-books') || "https://picsum.photos/seed/listing3/600/400",
    mediaType: 'image',
    sellerId: 'user_1',
    seller: getListingSeller('user_1'),
    status: 'sold',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    college: 'IIT Bombay',
    location: iitBombayLocation,
  },
  {
    id: 'listing_4',
    title: 'Need Teammate for Smart India Hackathon',
    description: 'Looking for a backend developer (Node.js/Django) for our team for the Smart India Hackathon. We have a great idea for a healthcare solution.',
    category: 'Community/Collaboration',
    price: 0.00,
    mediaUrl: findImage('listing-hackathon') || "https://picsum.photos/seed/listing4/600/400",
    mediaType: 'image',
    sellerId: 'user_1',
    seller: getListingSeller('user_1'),
    status: 'active',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    college: 'IIT Bombay',
    location: iitBombayLocation,
  },
  {
    id: 'listing_5',
    title: 'Homemade North Indian Tiffin Service',
    description: 'Delicious and healthy home-cooked North Indian meals delivered to your hostel or PG. Weekly and monthly plans available. (Only for DU campus)',
    category: 'Services',
    price: 120.00,
    mediaUrl: findImage('listing-tiffin') || "https://picsum.photos/seed/listing5/600/400",
    mediaType: 'image',
    sellerId: 'user_3',
    seller: getListingSeller('user_3'),
    status: 'active',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    college: 'Delhi University',
    location: duLocation,
  },
  {
    id: 'listing_8',
    title: 'Used Bicycle for Campus Commute',
    description: 'A Hero cycle in good working condition. Perfect for getting around the large DU campus. Minor scratches but runs smoothly. Price is negotiable.',
    category: 'Physical Products',
    price: 2000,
    mediaUrl: findImage('listing-bicycle') || "https://picsum.photos/seed/listing8/600/400",
    mediaType: 'image',
    sellerId: 'user_3',
    seller: getListingSeller('user_3'),
    status: 'active',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    college: 'Delhi University',
    location: duLocation,
  },
  {
    id: 'listing_7',
    title: 'Fiction Novel Bundles (Set of 3)',
    description: 'Choose any three fiction novels from my collection for a discounted price. Authors include Murakami, Adichie, and more. DM for the list.',
    category: 'Physical Products',
    price: 750,
    mediaUrl: findImage('listing-novels') || "https://picsum.photos/seed/listing7/600/400",
    mediaType: 'image',
    sellerId: 'user_3',
    seller: getListingSeller('user_3'),
    status: 'sold',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
    college: 'Delhi University',
    location: duLocation,
  },
  {
    id: 'listing_9',
    title: 'Event Photography & Videography',
    description: 'Covering college events, birthdays, and workshops. I have a Sony A7III and can deliver edited photos within 48 hours.',
    category: 'Services',
    price: 3500,
    mediaUrl: findImage('listing-event-photography') || "https://picsum.photos/seed/listing9/600/400",
    mediaType: 'image',
    sellerId: 'user_2',
    seller: getListingSeller('user_2'),
    status: 'active',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    college: 'Christ University, Bangalore',
    location: christUniLocation,
  },
  {
    id: 'listing_10',
    title: 'Beginner Acoustic Guitar Lessons',
    description: 'One-on-one guitar lessons for beginners. Learn chords, strumming patterns, and your favorite songs. I have been playing for 5 years.',
    category: 'Services',
    price: 400,
    mediaUrl: findImage('listing-guitar-lessons') || "https://picsum.photos/seed/listing10/600/400",
    mediaType: 'image',
    sellerId: 'user_3',
    seller: getListingSeller('user_3'),
    status: 'active',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    college: 'Delhi University',
    location: duLocation,
  },
  {
    id: 'listing_11',
    title: 'Scientific Calculator (CASIO fx-991ES PLUS)',
    description: 'Barely used scientific calculator, essential for engineering and science students. In perfect working condition with cover.',
    category: 'Physical Products',
    price: 600,
    mediaUrl: findImage('listing-calc-ra') || "https://picsum.photos/seed/listing11/600/400",
    mediaType: 'image',
    sellerId: 'user_1',
    seller: getListingSeller('user_1'),
    status: 'active',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    college: 'IIT Bombay',
    location: iitBombayLocation,
  }
];

export const dummyTransactions: Omit<Transaction, 'id'>[] = [
    {
        transactionId: 'txn_1',
        buyerId: 'user_2',
        sellerId: 'user_1',
        listingId: 'listing_3',
        amount: 1500,
        status: 'completed',
        paymentMethod: 'NexusCredits',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 29).toISOString(),
    },
    {
        transactionId: 'txn_2',
        buyerId: 'user_1',
        sellerId: 'user_3',
        listingId: 'listing_7',
        amount: 750,
        status: 'completed',
        paymentMethod: 'NexusCredits',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 44).toISOString(),
    }
];

export const dummyReviews: Omit<Review, 'id' >[] = [
    {
        listingId: 'listing_3',
        sellerId: 'user_1',
        buyerId: 'user_2',
        reviewerId: 'user_2',
        rating: 5,
        comment: 'Books were in perfect condition, just as described. Priya was super quick to respond and arrange the pickup. Highly recommend!',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28).toISOString(),
    },
    {
        listingId: 'listing_7',
        sellerId: 'user_3',
        buyerId: 'user_1',
        reviewerId: 'user_1',
        rating: 4,
        comment: 'Great collection of books! Ananya was very helpful. One of the book covers was a little worn, but otherwise a great deal.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 43).toISOString(),
    }
];


    

    
