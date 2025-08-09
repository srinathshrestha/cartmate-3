// Shopping Lists API Routes
// GET: Fetch user's lists (private + shared)
// POST: Create new list (private or shared)

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

// GET /api/lists - Get user's shopping lists
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // Get user's owned lists
    const ownedLists = await prisma.shoppingList.findMany({
      where: { ownerId: user.id },
      include: {
        members: { include: { user: true } },
        items: true,
        _count: {
          select: {
            items: true,
            members: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Get lists user is a member of
    const memberLists = await prisma.shoppingList.findMany({
      where: {
        members: {
          some: { userId: user.id },
        },
      },
      include: {
        owner: true,
        members: { include: { user: true } },
        items: true,
        _count: {
          select: {
            items: true,
            members: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Combine and format lists
    const allLists = [
      ...ownedLists.map((list) => ({
        ...list,
        isOwner: true,
        memberCount: list.isShared ? list._count.members + 1 : 1, // +1 for owner
        itemCount: list._count.items,
      })),
      ...memberLists.map((list) => ({
        ...list,
        isOwner: false,
        memberCount: list._count.members + 1, // +1 for owner
        itemCount: list._count.items,
      })),
    ];

    return NextResponse.json({ lists: allLists });
  } catch (error) {
    console.error("Error fetching lists:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/lists - Create new shopping list
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, isShared = false } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "List name is required" },
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

    // Create shopping list
    const newList = await prisma.shoppingList.create({
      data: {
        name: name.trim(),
        ownerId: user.id,
        isShared: Boolean(isShared),
        inviteCode: isShared ? nanoid(8) : null, // Generate invite code for shared lists
      },
      include: {
        owner: { select: { id: true, name: true } },
        members: { include: { user: true } },
        items: true,
        _count: {
          select: {
            items: true,
            members: true,
          },
        },
      },
    });

    const formattedList = {
      ...newList,
      isOwner: true,
      memberCount: newList.isShared ? newList._count.members + 1 : 1,
      itemCount: newList._count.items,
    };

    return NextResponse.json({ list: formattedList }, { status: 201 });
  } catch (error) {
    console.error("Error creating list:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
