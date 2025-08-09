// Join Shopping List Page via Invite Link
// Handles invitation acceptance from email links

import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { JoinListView } from "@/components/join-list-view";
import Link from "next/link";

interface JoinPageProps {
  params: Promise<{ inviteCode: string }>;
}

async function getListByInviteCode(inviteCode: string) {
  const list = await prisma.shoppingList.findUnique({
    where: {
      inviteCode: inviteCode,
      isShared: true,
    },
    include: {
      owner: { select: { name: true } },
      _count: {
        select: {
          items: true,
          members: true,
        },
      },
    },
  });

  return list;
}

export default async function JoinPage({ params }: JoinPageProps) {
  const { userId } = await auth();
  const { inviteCode } = await params;

  if (!userId) {
    // Store invite code in URL params for after sign-in
    redirect(`/sign-in?redirect=/join/${inviteCode}`);
  }

  const list = await getListByInviteCode(inviteCode);

  if (!list) {
    // Invalid or expired invite code
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
              <span className="text-2xl">❌</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Invalid Invitation
            </h1>
            <p className="text-muted-foreground">
              This invitation link is invalid or has expired.
            </p>
          </div>
          <Link
            href="/"
            className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <JoinListView list={list} inviteCode={inviteCode} />
    </div>
  );
}
