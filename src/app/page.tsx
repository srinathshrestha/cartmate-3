// CartMate Homepage - My Lists View
// Shows user's private and shared shopping lists

import { auth } from "@clerk/nextjs/server";
import { Navigation } from "@/components/navigation";
import { ShoppingListsGrid } from "@/components/shopping-lists-grid";
import { LandingPage } from "@/components/landing-page";

export default async function HomePage() {
  // Check if user is authenticated
  const { userId } = await auth();

  // Show landing page for non-authenticated users
  if (!userId) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            My Shopping Lists
          </h1>
          <p className="text-muted-foreground">
            Create new lists or collaborate on shared ones
          </p>
        </div>

        {/* Shopping Lists Grid */}
        <ShoppingListsGrid />
      </main>
    </div>
  );
}
