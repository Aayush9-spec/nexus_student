import { notFound } from 'next/navigation';
import { ListingDetailContent } from './ListingContent';

export default async function ListingDetailPage({ params }: any) {
  const { listingId } = await params;

  if (!listingId) {
    notFound();
  }

  return <ListingDetailContent listingId={listingId} />;
}
