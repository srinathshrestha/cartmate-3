"use client";

// Join List View Component
// Shows list details and allows joining

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, ShoppingCart, UserPlus, Loader2 } from "lucide-react";

interface ShoppingList {
  id: string;
  name: string;
  ownerId: string;
  isShared: boolean;
  inviteCode: string | null;
  createdAt: Date;
  owner: {
    name: string;
  };
  _count: {
    items: number;
    members: number;
  };
}

interface JoinListViewProps {
  list: ShoppingList;
  inviteCode: string;
}

export function JoinListView({ list, inviteCode }: JoinListViewProps) {
  const [isJoining, setIsJoining] = useState(false);
  const router = useRouter();

  const handleJoinList = async () => {
    setIsJoining(true);

    try {
      const response = await fetch("/api/lists/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inviteCode,
        }),
      });

      if (response.ok) {
        const { list: joinedList } = await response.json();
        // Redirect to the newly joined list
        router.push(`/list/${joinedList.id}`);
      } else {
        const { error } = await response.json();
        alert("Error joining list: " + error);
      }
    } catch (error) {
      console.error("Error joining list:", error);
      alert("Error joining list. Please try again.");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full"
      >
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <ShoppingCart className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">
              You&apos;re Invited to Join!
            </CardTitle>
            <p className="text-muted-foreground">
              {list.owner.name} has invited you to collaborate on their shopping
              list
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* List Info */}
            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{list.name}</h3>
                <Badge>
                  <Users className="h-3 w-3 mr-1" />
                  Shared
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  <span>{list._count.items} items</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{list._count.members + 1} members</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Created by {list.owner.name}</span>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <h4 className="font-medium">What you can do:</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Add and manage shopping items
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Check off completed items
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  Chat with other members
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                  See real-time updates
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleJoinList}
                disabled={isJoining}
                className="flex-1"
              >
                {isJoining ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Join List
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="flex-1"
              >
                Maybe Later
              </Button>
            </div>

            {/* Invite Code */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-2">Invite Code:</p>
              <code className="text-sm bg-muted px-3 py-1 rounded">
                {inviteCode}
              </code>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
