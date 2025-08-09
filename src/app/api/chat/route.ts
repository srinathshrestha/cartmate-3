// Chat Messages API Routes
// GET: Fetch chat messages for a list
// POST: Send new chat message

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// GET /api/chat?listId=... - Get chat messages for a shopping list
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
        isShared: true, // Only shared lists have chat
        OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }],
      },
    });

    if (!list) {
      return NextResponse.json(
        { error: "List not found or access denied" },
        { status: 404 }
      );
    }

    // Get chat messages for the list
    const messages = await prisma.chatMessage.findMany({
      where: { listId },
      include: {
        user: { select: { id: true, name: true } },
        replyTo: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: "asc" },
      take: 100, // Limit to last 100 messages
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/chat - Send new chat message
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { listId, message, replyTo } = body;

    // Validate required fields
    if (!listId || !message || typeof message !== "string") {
      return NextResponse.json(
        { error: "List ID and message are required" },
        { status: 400 }
      );
    }

    if (message.trim().length === 0) {
      return NextResponse.json(
        { error: "Message cannot be empty" },
        { status: 400 }
      );
    }

    if (message.length > 1000) {
      return NextResponse.json(
        { error: "Message too long (max 1000 characters)" },
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
        isShared: true, // Only shared lists have chat
        OR: [{ ownerId: user.id }, { members: { some: { userId: user.id } } }],
      },
    });

    if (!list) {
      return NextResponse.json(
        { error: "List not found or access denied" },
        { status: 404 }
      );
    }

    // Create new chat message
    const newMessage = await prisma.chatMessage.create({
      data: {
        listId,
        userId: user.id,
        message: message.trim(),
        replyToId: replyTo || null,
      },
      include: {
        user: { select: { id: true, name: true } },
        replyTo: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
    });

    return NextResponse.json({ message: newMessage }, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
