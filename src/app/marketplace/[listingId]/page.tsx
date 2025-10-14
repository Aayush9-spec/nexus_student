import Image from 'next/image';
import Link from 'next/link';
import { dummyListings, dummyUsers } from '@/lib/dummy-data';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Star, MapPin } from 'lucide-react';

export default function ListingDetailPage({ params }: { params: { listingId: string } }) {
  const listing = dummyListings.find(l => l.id === params.listingId);

  if (!listing) {
    notFound();
  }

  const seller = dummyUsers.find(u => u.id === listing.sellerId);

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  };
  
  const reviews = [
      {id: '1', rating: 5, comment: 'Amazing quality and fast shipping!', reviewer: dummyUsers[0]},
      {id: '2', rating: 4, comment: 'Exactly as described. Would buy again.', reviewer: dummyUsers[2]},
  ]

  return (
    <div className="container mx-auto py-8">
      <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
        <div className="md:col-span-2">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg mb-4">
            <Image
              src={listing.mediaUrl || "https://picsum.photos/seed/placeholder/800/600"}
              alt={listing.title}
              fill
              className="object-cover"
              data-ai-hint="product image"
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold font-headline mb-2">{listing.title}</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary">{listing.category}</Badge>
            {seller && (
                <Badge variant="outline" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {seller.college}
                </Badge>
            )}
          </div>
          <p className="text-lg mt-4 text-foreground/80">{listing.description}</p>
        </div>
        <div className="md:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-4xl font-headline text-primary">
                {listing.price > 0 ? `$${listing.price.toFixed(2)}` : 'Free'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button size="lg" className="w-full">
                {listing.price > 0 ? 'Buy Now' : 'Get Item'}
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
        </div>
      </div>
      
      <Separator className="my-12" />

      <div>
        <h2 className="text-2xl font-bold font-headline mb-6">Reviews ({reviews.length})</h2>
        <div className="space-y-6">
            {reviews.map(review => (
                <Card key={review.id}>
                    <CardContent className="p-4 flex gap-4">
                        <Avatar>
                            <AvatarImage src={review.reviewer?.profilePictureUrl} />
                            <AvatarFallback>{getInitials(review.reviewer?.name || 'A')}</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold">{review.reviewer?.name}</p>
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-primary text-primary' : 'fill-muted stroke-muted-foreground'}`} />
                                    ))}
                                </div>
                            </div>
                             <p className="text-muted-foreground">{review.comment}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
      </div>
    </div>
  );
}
