// Email Invitation API Route
// POST: Send email invitation for shared shopping list

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import Mailgun from "mailgun.js";
import FormData from "form-data";

// Initialize Mailgun
const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY || "",
});

// POST /api/invite - Send email invitation
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { listId, email } = body;

    if (!listId || !email) {
      return NextResponse.json(
        { error: "List ID and email are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
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

    // Find the shopping list and verify ownership
    const list = await prisma.shoppingList.findFirst({
      where: {
        id: listId,
        ownerId: user.id,
        isShared: true, // Only shared lists can be invited to
      },
    });

    if (!list) {
      return NextResponse.json(
        { error: "List not found or not shareable" },
        { status: 404 }
      );
    }

    // Create invitation link
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/join/${list.inviteCode}`;

    // Email template
    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>You're invited to join a CartMate shopping list!</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f7f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #ffc0cb; margin-bottom: 10px; }
        .title { font-size: 20px; color: #333; margin-bottom: 10px; }
        .subtitle { color: #666; }
        .list-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .list-name { font-size: 18px; font-weight: 600; color: #333; margin-bottom: 8px; }
        .list-owner { color: #666; }
        .button { display: inline-block; background: #ffc0cb; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .invite-code { background: #f0f0f0; padding: 10px; border-radius: 4px; font-family: monospace; text-align: center; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🛒 CartMate</div>
          <h1 class="title">You're invited to collaborate!</h1>
          <p class="subtitle">${user.name} has invited you to join their shopping list</p>
        </div>
        
        <div class="list-info">
          <div class="list-name">${list.name}</div>
          <div class="list-owner">Created by ${user.name}</div>
        </div>
        
        <p>Join this shared shopping list to collaborate in real-time. Add items, check them off, and chat with other members!</p>
        
        <div style="text-align: center;">
          <a href="${inviteLink}" class="button">Join Shopping List</a>
        </div>
        
        <p>Or enter this invite code manually:</p>
        <div class="invite-code">${list.inviteCode}</div>
        
        <div class="footer">
          <p>CartMate - Simple collaborative shopping lists</p>
          <p>If you didn't expect this invitation, you can safely ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    // Send email via Mailgun
    const result = await mg.messages.create(process.env.MAILGUN_DOMAIN || "", {
      from: `CartMate <${process.env.MAILGUN_FROM_EMAIL}>`,
      to: email,
      subject: `${user.name} invited you to join "${list.name}" on CartMate`,
      html: emailHtml,
      text: `${user.name} has invited you to join their shopping list "${list.name}" on CartMate. 

Join here: ${inviteLink}

Or enter invite code: ${list.inviteCode}

CartMate - Simple collaborative shopping lists`,
    });

    return NextResponse.json({
      message: "Invitation sent successfully",
      messageId: result.id,
    });
  } catch (error) {
    console.error("Error sending invitation:", error);
    return NextResponse.json(
      { error: "Failed to send invitation" },
      { status: 500 }
    );
  }
}
