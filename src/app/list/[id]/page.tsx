// Individual Shopping List View Page
// Shows items and chat for a specific list

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Navigation } from "@/components/navigation";
import { ShoppingListView } from "@/components/shopping-list-view";

interface ListPageProps {
  params: Promise<{ id: string }>;
}

async function getShoppingList(listId: string, userId: string) {
  // Find or create user in database
  let user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    // Create user if doesn't exist
    try {
      const userInfo = await fetch(`https://api.clerk.dev/v1/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        },
      }).then((res) => res.json());

      user = await prisma.user.create({
        data: {
          clerkUserId: userId,
          email: userInfo.email_addresses[0]?.email_address || "",
          name: userInfo.first_name || userInfo.username || "User",
        },
      });
    } catch (error) {
      console.error("Error creating user:", error);
      return null;
    }
  }

  // Get the shopping list with access check
  const list = await prisma.shoppingList.findFirst({
    where: {
      id: listId,
      OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }],
    },
    include: {
      owner: { select: { id: true, name: true } },
      members: {
        include: {
          user: { select: { id: true, name: true } },
        },
      },
      items: {
        include: {
          addedBy: { select: { id: true, name: true } },
          completedBy: { select: { id: true, name: true } },
        },
        orderBy: [{ isCompleted: "asc" }, { createdAt: "desc" }],
      },
    },
  });

  if (!list) {
    return null;
  }

  return {
    ...list,
    isOwner: list.ownerId === user.id,
    currentUser: user,
  };
}

export default async function ListPage({ params }: ListPageProps) {
  const { userId } = await auth();
  const { id } = await params;

  if (!userId) {
    redirect("/sign-in");
  }

  const list = await getShoppingList(id, userId);

  if (!list) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="container mx-auto px-4 py-6">
        <ShoppingListView list={list} />
      </main>
    </div>
  );
}
