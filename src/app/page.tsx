import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { dummyListings, dummyUsers } from '@/lib/dummy-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight } from 'lucide-react';
import { ListingCard } from './marketplace/components/ListingCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-image');
  const trendingListings = dummyListings.slice(0, 4);
  const featuredStudents = dummyUsers.slice(0, 3);
  
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return names[0].substring(0, 2);
  };

  return (
    <div className="flex flex-col">
      <section className="relative w-full h-[50vh] md:h-[60vh] text-white">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover"
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative h-full flex flex-col items-center justify-center text-center p-4">
          <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 drop-shadow-lg">
            The Student-Powered Marketplace
          </h1>
          <p className="text-lg md:text-2xl mb-8 max-w-3xl drop-shadow-md">
            Discover, buy, and sell goods, services, and skills within your campus community.
          </p>
          <Link href="/marketplace">
            <Button size="lg">
              Explore Marketplace <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      <section className="container mx-auto py-12 md:py-16">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-headline font-bold">Trending Listings</h2>
            <Link href="/marketplace">
                <Button variant="outline">View All <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      <section className="bg-muted py-12 md:py-16">
        <div className="container mx-auto">
            <h2 className="text-2xl md:text-3xl font-headline font-bold text-center mb-8">Featured Students</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredStudents.map(student => (
                    <Link href={`/profile/${student.id}`} key={student.id}>
                        <Card className="hover:shadow-lg transition-shadow">
                            <CardContent className="flex flex-col items-center text-center p-6">
                                <Avatar className="w-24 h-24 mb-4 border-4 border-accent">
                                    <AvatarImage src={student.profilePictureUrl} alt={student.name} />
                                    <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                                </Avatar>
                                <h3 className="font-bold text-lg">{student.name}</h3>
                                <p className="text-primary font-semibold">{student.college}</p>
                                <p className="text-muted-foreground text-sm mt-2 line-clamp-2">{student.bio}</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
      </section>
    </div>
  );
}
