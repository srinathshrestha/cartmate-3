// Shopping List Items API Routes
// GET: Fetch items for a specific list
// POST: Add new item to list

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET /api/items?listId=... - Get items for a shopping list
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const listId = searchParams.get("listId");

    if (!listId) {
      return NextResponse.json(
        { error: "List ID is required" },
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

    // Check if user has access to this list (owner or member)
    const list = await prisma.shoppingList.findFirst({
      where: {
        id: listId,
        OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }],
      },
    });

    if (!list) {
      return NextResponse.json(
        { error: "List not found or access denied" },
        { status: 404 }
      );
    }

    // Get items for the list
    const items = await prisma.item.findMany({
      where: { listId },
      include: {
        addedBy: { select: { id: true, name: true } },
        completedBy: { select: { id: true, name: true } },
      },
      orderBy: [
        { isCompleted: "asc" }, // Show incomplete items first
        { createdAt: "desc" }, // Then by newest first
      ],
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/items - Add new item to shopping list
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { listId, name, quantity, description, category } = body;

    // Validate required fields
    if (!listId || !name || !quantity) {
      return NextResponse.json(
        {
          error: "List ID, name, and quantity are required",
        },
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

    // Check if user has access to this list (owner or member)
    const list = await prisma.shoppingList.findFirst({
      where: {
        id: listId,
        OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }],
      },
    });

    if (!list) {
      return NextResponse.json(
        { error: "List not found or access denied" },
        { status: 404 }
      );
    }

    // Create new item
    const newItem = await prisma.item.create({
      data: {
        listId,
        name: name.trim(),
        quantity: quantity.trim(),
        description: description?.trim() || null,
        category: category?.trim() || null,
        addedById: user.id,
      },
      include: {
        addedBy: { select: { id: true, name: true } },
        completedBy: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ item: newItem }, { status: 201 });
  } catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
