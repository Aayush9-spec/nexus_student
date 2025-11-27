import { notFound } from 'next/navigation';
import { ProfileContent } from './ProfileContent';

export default async function ProfilePage({ params }: any) {
  const { userId } = await params;

  if (!userId) {
    notFound();
  }

  return <ProfileContent userId={userId} />;
}
