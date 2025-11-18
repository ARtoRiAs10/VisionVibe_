import { currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { designs, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { DesignGallery } from '@/components/design-gallery';
import { redirect } from 'next/navigation';

export default async function DesignsPage() {
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  const dbUser = await db.query.users.findFirst({
    where: eq(users.clerkId, user.id),
  });

  if (!dbUser) {
    return <div>User not found</div>;
  }

  const userDesigns = await db.query.designs.findMany({
    where: eq(designs.userId, dbUser.id),
    orderBy: (designs) => [designs.createdAt],
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">
          Your Designs
        </h1>

        <DesignGallery designs={userDesigns} />
      </div>
    </div>
  );
}
