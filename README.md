# Nexus Student Marketplace 🎓

A modern, feature-rich marketplace platform designed specifically for university students to buy, sell, and trade items within their campus community. Built with Next.js, Firebase, and AI-powered features.

![Nexus Marketplace Banner](https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1200&h=400)

## 🚀 Features

### 🛒 Marketplace
- **Browse & Search**: Filter listings by category, price range, and location.
- **Rich Media**: Support for product images and video previews.
- **AI Analysis**: Get instant AI-generated insights on pricing fairness and product details.
- **Favorites**: Save listings to your wishlist for later.

### 📦 Selling & Buying
- **Easy Listing Creation**: AI-assisted category suggestions and image uploads.
- **Shopping Cart**: Add multiple items and manage quantities.
- **Secure Checkout**: Simulated payment processing with multiple options:
  - 💳 Credit/Debit Card
  - 📱 UPI (Unified Payments Interface)
  - 💵 Cash on Delivery (COD)
- **Order Tracking**: View order history and status in your profile.

### 👤 User Profiles
- **Comprehensive Profiles**: Showcase bio, college details, skills, and social links.
- **Seller Dashboard**: Track sales, view earnings, and manage listings.
- **Reputation System**: Ratings and reviews to build trust within the community.
- **Badges & XP**: Gamified experience with seller levels (Silver, Gold, Platinum).

### 💬 Communication
- **Real-time Chat**: Integrated messaging system for buyers and sellers to negotiate and arrange meetups.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) & [Radix UI](https://www.radix-ui.com/)
- **Backend & Auth**: [Firebase](https://firebase.google.com/) (Firestore, Auth, Storage)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)

## 🏁 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- A Firebase project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nexus-student-marketplace.git
   cd nexus-student-marketplace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env.local` file in the root directory and add your Firebase configuration and other keys:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   # Optional: For AI features
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the app running.

## 📸 Screenshots

| Marketplace | Product Details |
|:---:|:---:|
| ![Marketplace](https://images.unsplash.com/photo-1472851294608-415522f96319?auto=format&fit=crop&q=80&w=500&h=300) | ![Product](https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&q=80&w=500&h=300) |

| Checkout | User Profile |
|:---:|:---:|
| ![Checkout](https://images.unsplash.com/photo-1556742031-c6961e8560b0?auto=format&fit=crop&q=80&w=500&h=300) | ![Profile](https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&q=80&w=500&h=300) |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
