// Individual Item API Routes
// PUT: Edit item details
// DELETE: Delete item

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// PUT /api/items/[id] - Edit item details
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, quantity, description, category } = body;

    // Validate required fields
    if (!name || !quantity) {
      return NextResponse.json(
        { error: "Name and quantity are required" },
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

    // Update the item
    const updatedItem = await prisma.item.update({
      where: { id },
      data: {
        name: name.trim(),
        quantity: quantity.trim(),
        description: description?.trim() || null,
        category: category?.trim() || null,
      },
      include: {
        addedBy: { select: { id: true, name: true } },
        completedBy: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ item: updatedItem });
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/items/[id] - Delete item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

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

    // Delete the item
    await prisma.item.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Item deleted successfully",
      deletedItem: {
        id: item.id,
        name: item.name,
        listId: item.listId,
      },
    });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
