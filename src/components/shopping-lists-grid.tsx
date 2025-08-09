"use client";

// Shopping Lists Grid Component
// Displays user's private and shared lists with create/join functionality

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Users, Lock, ShoppingCart, Calendar } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email?: string;
}

interface ShoppingList {
  id: string;
  name: string;
  ownerId: string;
  isShared: boolean;
  inviteCode?: string;
  createdAt: string;
  owner: User;
  itemCount: number;
  memberCount: number;
}

export function ShoppingListsGrid() {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isJoinDialogOpen, setIsJoinDialogOpen] = useState(false);
  const [createMode, setCreateMode] = useState<"private" | "shared" | null>(
    null
  );
  const [newListName, setNewListName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  useUser(); // For authentication
  const router = useRouter();

  // Animation variants for list cards
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { scale: 1.02, transition: { duration: 0.2 } },
  };

  // Load user's lists on component mount
  useEffect(() => {
    fetchLists();
  }, []);

  const fetchLists = async () => {
    try {
      const response = await fetch("/api/lists");
      if (response.ok) {
        const { lists } = await response.json();
        setLists(lists);
      }
    } catch (error) {
      console.error("Error fetching lists:", error);
    }
  };

  const handleCreateList = async (isShared: boolean) => {
    if (!newListName.trim()) return;

    try {
      const response = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newListName,
          isShared,
        }),
      });

      if (response.ok) {
        const { list } = await response.json();
        setLists((prev) => [list, ...prev]);
        setNewListName("");
        setIsCreateDialogOpen(false);
      } else {
        const { error } = await response.json();
        alert("Error creating list: " + error);
      }
    } catch (error) {
      console.error("Error creating list:", error);
      alert("Error creating list. Please try again.");
    }
  };

  const handleJoinList = async () => {
    if (!inviteCode.trim()) return;

    try {
      const response = await fetch("/api/lists/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inviteCode: inviteCode.trim(),
        }),
      });

      if (response.ok) {
        const { list } = await response.json();
        setLists((prev) => [list, ...prev]);
        setInviteCode("");
        setIsJoinDialogOpen(false);
      } else {
        const { error } = await response.json();
        alert("Error joining list: " + error);
      }
    } catch (error) {
      console.error("Error joining list:", error);
      alert("Error joining list. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons at Top */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-6 bg-card border border-border rounded-lg shadow-sm"
      >
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-1">
            {lists.length === 0
              ? "Create Your First List"
              : "Your Shopping Lists"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {lists.length === 0
              ? "Start by creating a private list or a shared one to collaborate with others"
              : `You have ${lists.length} shopping list${
                  lists.length === 1 ? "" : "s"
                }`}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Create Private List */}
          <Button
            onClick={() => {
              console.log("Create Private List clicked");
              setNewListName("");
              setCreateMode("private");
              setIsCreateDialogOpen(true);
            }}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Lock className="h-4 w-4" />
            Create Private List
          </Button>

          {/* Create Shared List */}
          <Button
            onClick={() => {
              console.log("Create Shared List clicked");
              setNewListName("");
              setCreateMode("shared");
              setIsCreateDialogOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Create Shared List
          </Button>

          {/* Join List */}
          <Button
            onClick={() => {
              console.log("Join List clicked");
              setInviteCode("");
              setIsJoinDialogOpen(true);
            }}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Join List
          </Button>
        </div>
      </motion.div>

      {/* Dialogs */}
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) setCreateMode(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Create{" "}
              {createMode === "private"
                ? "Private"
                : createMode === "shared"
                ? "Shared"
                : ""}{" "}
              Shopping List
              {createMode && (
                <span className="ml-2">
                  {createMode === "private" ? (
                    <Lock className="h-4 w-4 inline" />
                  ) : (
                    <Users className="h-4 w-4 inline" />
                  )}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="List name (e.g., Weekly Groceries)"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && newListName.trim() && createMode) {
                  handleCreateList(createMode === "shared");
                }
              }}
              autoFocus
            />
            {createMode ? (
              <div className="flex gap-2">
                <Button
                  onClick={() => setCreateMode(null)}
                  variant="outline"
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={() => handleCreateList(createMode === "shared")}
                  className="flex-1"
                  disabled={!newListName.trim()}
                >
                  Create {createMode === "private" ? "Private" : "Shared"} List
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={() => handleCreateList(false)}
                  variant="outline"
                  className="flex-1"
                  disabled={!newListName.trim()}
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Private List
                </Button>
                <Button
                  onClick={() => handleCreateList(true)}
                  className="flex-1"
                  disabled={!newListName.trim()}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Shared List
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isJoinDialogOpen} onOpenChange={setIsJoinDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join Shopping List</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Invite Code or Link
              </label>
              <Input
                placeholder="Enter invite code (e.g., ABC123) or paste invite link"
                value={inviteCode}
                onChange={(e) => {
                  const value = e.target.value;
                  // Extract invite code from URL if it's a full link
                  if (value.includes("/join/")) {
                    const codeMatch = value.match(/\/join\/([^/?]+)/);
                    if (codeMatch) {
                      setInviteCode(codeMatch[1]);
                      return;
                    }
                  }
                  setInviteCode(value);
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && inviteCode.trim()) {
                    handleJoinList();
                  }
                }}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                You can paste either an invite code or a full invite link
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setIsJoinDialogOpen(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleJoinList}
                className="flex-1"
                disabled={!inviteCode.trim()}
              >
                <Users className="h-4 w-4 mr-2" />
                Join List
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Quick Actions for Existing Lists */}
      {lists.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex flex-wrap gap-3 p-4 bg-muted/50 rounded-lg"
        >
          <p className="text-sm text-muted-foreground self-center">
            Quick actions:
          </p>
          <Button
            onClick={() => {
              setNewListName("");
              setCreateMode("private");
              setIsCreateDialogOpen(true);
            }}
            size="sm"
            variant="outline"
            className="flex items-center gap-2"
          >
            <Plus className="h-3 w-3" />
            New Private
          </Button>
          <Button
            onClick={() => {
              setNewListName("");
              setCreateMode("shared");
              setIsCreateDialogOpen(true);
            }}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-3 w-3" />
            New Shared
          </Button>
          <Button
            onClick={() => {
              setInviteCode("");
              setIsJoinDialogOpen(true);
            }}
            size="sm"
            variant="secondary"
            className="flex items-center gap-2"
          >
            <Users className="h-3 w-3" />
            Join List
          </Button>
        </motion.div>
      )}

      {/* Lists Grid */}
      {lists.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 text-muted-foreground"
        >
          <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No shopping lists yet</h3>
          <p>Create your first list to get started!</p>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          <AnimatePresence>
            {lists.map((list) => (
              <motion.div
                key={list.id}
                variants={cardVariants}
                whileHover="hover"
                layout
              >
                <Card
                  className="shopping-item-card cursor-pointer"
                  onClick={() => router.push(`/list/${list.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-semibold line-clamp-1">
                        {list.name}
                      </CardTitle>
                      <Badge variant={list.isShared ? "default" : "secondary"}>
                        {list.isShared ? (
                          <Users className="h-3 w-3 mr-1" />
                        ) : (
                          <Lock className="h-3 w-3 mr-1" />
                        )}
                        {list.isShared ? "Shared" : "Private"}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Stats */}
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{list.itemCount} items</span>
                      {list.isShared && <span>{list.memberCount} members</span>}
                    </div>

                    {/* Owner and Date */}
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>
                        Created by {list.owner?.name} on{" "}
                        {new Date(list.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
