// Toggle Item Completion API Route
// POST: Toggle item completed status and track who completed it

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// POST /api/items/[id]/toggle - Toggle item completion status
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Item ID is required" },
        { status: 400 }
      );
    }

    // Find or create user in database
    let user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      // Create user if doesn't exist
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
    }

    // Find the item and check access
    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        list: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Check if user has access to this list (owner or member)
    const hasAccess =
      item.list.ownerId === user.id ||
      item.list.members.some((member) => member.userId === user.id);

    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Toggle completion status
    const updatedItem = await prisma.item.update({
      where: { id },
      data: {
        isCompleted: !item.isCompleted,
        completedById: !item.isCompleted ? user.id : null,
        completedAt: !item.isCompleted ? new Date() : null,
      },
      include: {
        addedBy: { select: { id: true, name: true } },
        completedBy: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ item: updatedItem });
  } catch (error) {
    console.error("Error toggling item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
