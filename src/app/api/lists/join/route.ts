// Join Shopping List API Route
// POST: Join a shared list using invite code

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// POST /api/lists/join - Join shared list via invite code
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { inviteCode } = body;

    if (!inviteCode || typeof inviteCode !== "string") {
      return NextResponse.json(
        { error: "Invite code is required" },
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

    // Find shopping list by invite code
    const shoppingList = await prisma.shoppingList.findUnique({
      where: {
        inviteCode: inviteCode.trim(),
      },
      include: {
        owner: true,
        members: true,
      },
    });

    if (!shoppingList) {
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 404 }
      );
    }

    if (!shoppingList.isShared) {
      return NextResponse.json(
        { error: "This list is not shared" },
        { status: 400 }
      );
    }

    // Check if user is already owner
    if (shoppingList.ownerId === user.id) {
      return NextResponse.json(
        { error: "You already own this list" },
        { status: 400 }
      );
    }

    // Check if user is already a member
    const existingMember = shoppingList.members.find(
      (member) => member.userId === user.id
    );
    if (existingMember) {
      return NextResponse.json(
        { error: "You are already a member of this list" },
        { status: 400 }
      );
    }

    // Add user as member
    await prisma.listMember.create({
      data: {
        listId: shoppingList.id,
        userId: user.id,
      },
    });

    // Return the updated list
    const updatedList = await prisma.shoppingList.findUnique({
      where: { id: shoppingList.id },
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
    });

    const formattedList = {
      ...updatedList,
      isOwner: false,
      memberCount: updatedList!._count.members + 1, // +1 for owner
      itemCount: updatedList!._count.items,
    };

    return NextResponse.json({ list: formattedList }, { status: 200 });
  } catch (error) {
    console.error("Error joining list:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
