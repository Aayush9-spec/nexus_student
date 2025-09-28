import { dummyUsers } from "@/lib/dummy-data";
import { notFound } from 'next/navigation';
import { ProfileHeader } from "../components/ProfileHeader";
import { UserListings } from "../components/UserListings";

export default function ProfilePage({ params }: { params: { userId: string } }) {
  const user = dummyUsers.find(u => u.id === params.userId);

  if (!user) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        <ProfileHeader user={user} />
        <UserListings userId={user.id} />
      </div>
    </div>
  );
}
