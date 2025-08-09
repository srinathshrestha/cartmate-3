"use client";

// Shopping List View Component
// Displays items and chat (for shared lists) in split layout

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Users, Lock, Share2, Mail, Copy, Loader2 } from "lucide-react";
import { useSocket } from "@/contexts/socket-context";
import { useUser } from "@clerk/nextjs";
import { ItemCard } from "@/components/item-card";
import { EnhancedChat } from "@/components/enhanced-chat";

interface User {
  id: string;
  name: string;
  email?: string;
  fullName?: string;
  firstName?: string;
}

interface ShoppingList {
  id: string;
  name: string;
  ownerId: string;
  isShared: boolean;
  inviteCode: string | null;
  createdAt: Date;
  owner: {
    id: string;
    name: string;
  };
  members: {
    id: string;
    userId: string;
    listId: string;
    joinedAt: Date;
    user: {
      id: string;
      name: string;
    };
  }[];
  items: ListItem[];
  isOwner: boolean;
  currentUser: {
    id: string;
    clerkUserId: string;
    email: string;
    name: string;
    createdAt: Date;
  };
}

interface ListItem {
  id: string;
  name: string;
  quantity: string;
  description: string | null;
  category: string | null;
  isCompleted: boolean;
  addedById: string;
  completedById: string | null;
  createdAt: Date;
  completedAt: Date | null;
  addedBy: {
    id: string;
    name: string;
  };
  completedBy: {
    id: string;
    name: string;
  } | null;
}

interface EditItemData {
  name: string;
  quantity: string;
  description: string;
  category: string;
}

interface ChatMessage {
  id: string;
  listId: string;
  userId: string;
  message: string;
  replyToId?: string;
  replyTo?: {
    id: string;
    message: string;
    user: User;
  };
  createdAt: string;
  user: User;
}

interface ShoppingListViewProps {
  list: ShoppingList;
}

// Categories for items
const CATEGORIES = [
  "🥬 Produce",
  "🥛 Dairy",
  "🍖 Meat",
  "🥫 Pantry",
  "🧻 Household",
  "🧴 Personal Care",
  "📦 Other",
];

export function ShoppingListView({ list }: ShoppingListViewProps) {
  const [items, setItems] = useState<ListItem[]>(list.items || []);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<User[]>([]);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [emailToInvite, setEmailToInvite] = useState("");
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: "",
    description: "",
    category: "",
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { user } = useUser();
  const {
    joinList,
    leaveList,
    sendMessage,
    sendTypingStart,
    sendTypingStop,
    onItemUpdate,
    onNewMessage,
    onUserTyping,
    emitItemUpdate,
    isConnected,
  } = useSocket();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Join list room on mount and setup real-time listeners
  useEffect(() => {
    if (list.isShared && isConnected) {
      joinList(list.id);

      // Load chat messages
      const loadMessages = async () => {
        if (!list.isShared) return;

        try {
          const response = await fetch(`/api/chat?listId=${list.id}`);
          if (response.ok) {
            const { messages } = await response.json();
            setMessages(messages);
            scrollToBottom();
          }
        } catch (error) {
          console.error("Error loading messages:", error);
        }
      };

      loadMessages();

      // Setup real-time listeners
      const cleanup = {
        itemUpdate: undefined as (() => void) | undefined,
        newMessage: undefined as (() => void) | undefined,
        userTyping: undefined as (() => void) | undefined,
      };

      cleanup.itemUpdate = onItemUpdate((data) => {
        const { item, action } = data;
        if (action === "add") {
          setItems((prev) => [item as ListItem, ...prev]);
        } else if (action === "toggle") {
          setItems((prev) =>
            prev.map((i) => (i.id === item.id ? (item as ListItem) : i))
          );
        } else if (action === "edit") {
          setItems((prev) =>
            prev.map((i) => (i.id === item.id ? (item as ListItem) : i))
          );
        } else if (action === "delete") {
          setItems((prev) => prev.filter((i) => i.id !== item.id));
        }
      });

      cleanup.newMessage = onNewMessage((data) => {
        setMessages((prev) => [...prev, data as unknown as ChatMessage]);
        scrollToBottom();
      });

      cleanup.userTyping = onUserTyping((data) => {
        const { user: typingUser, isTyping } = data;
        setTypingUsers((prev) => {
          if (isTyping) {
            return prev.find((u) => u.id === typingUser.id)
              ? prev
              : [...prev, typingUser];
          } else {
            return prev.filter((u) => u.id !== typingUser.id);
          }
        });
      });

      return () => {
        leaveList(list.id);
        cleanup.itemUpdate?.();
        cleanup.newMessage?.();
        cleanup.userTyping?.();
      };
    }
  }, [
    list.id,
    list.isShared,
    isConnected,
    joinList,
    leaveList,
    onItemUpdate,
    onNewMessage,
    onUserTyping,
    scrollToBottom,
  ]);

  const handleAddItem = async () => {
    if (!newItem.name.trim() || !newItem.quantity.trim()) return;

    try {
      const response = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listId: list.id,
          ...newItem,
        }),
      });

      if (response.ok) {
        const { item } = await response.json();
        setItems((prev) => [item, ...prev]);
        setNewItem({ name: "", quantity: "", description: "", category: "" });
        setIsAddItemOpen(false);

        // Emit real-time update for shared lists
        if (list.isShared) {
          emitItemUpdate(list.id, item, "add", {
            id: user?.id || "",
            name: user?.fullName || user?.firstName || "User",
          });
        }
      }
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const toggleItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/items/${itemId}/toggle`, {
        method: "POST",
      });

      if (response.ok) {
        const { item } = await response.json();
        setItems((prev) => prev.map((i) => (i.id === itemId ? item : i)));

        // Emit real-time update for shared lists
        if (list.isShared) {
          emitItemUpdate(list.id, item, "toggle", {
            id: user?.id || "",
            name: user?.fullName || user?.firstName || "User",
          });
        }
      }
    } catch (error) {
      console.error("Error toggling item:", error);
    }
  };

  const handleEditItem = async (itemId: string, editData: EditItemData) => {
    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      if (response.ok) {
        const { item } = await response.json();
        setItems((prev) => prev.map((i) => (i.id === itemId ? item : i)));

        // Emit real-time update for shared lists
        if (list.isShared) {
          emitItemUpdate(list.id, item, "edit", {
            id: user?.id || "",
            name: user?.fullName || user?.firstName || "User",
          });
        }
      }
    } catch (error) {
      console.error("Error editing item:", error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const { deletedItem } = await response.json();
        setItems((prev) => prev.filter((i) => i.id !== itemId));

        // Emit real-time update for shared lists
        if (list.isShared) {
          emitItemUpdate(list.id, deletedItem, "delete", {
            id: user?.id || "",
            name: user?.fullName || user?.firstName || "User",
          });
        }
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleSendChatMessage = async (
    message: string,
    replyTo?: ChatMessage
  ) => {
    if (!message.trim() || !user) return;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listId: list.id,
          message: message.trim(),
          replyTo: replyTo?.id || null,
        }),
      });

      if (response.ok) {
        const { message: newMessage } = await response.json();

        // Send via Socket.io for real-time delivery
        sendMessage(list.id, newMessage, {
          id: user.id,
          name: user.fullName || user.firstName || "User",
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleStartTyping = () => {
    if (user) {
      sendTypingStart(list.id, {
        id: user.id,
        name: user.fullName || user.firstName || "User",
      });
    }
  };

  const handleStopTyping = () => {
    if (user) {
      sendTypingStop(list.id, {
        id: user.id,
        name: user.fullName || user.firstName || "User",
      });
    }
  };

  const handleSendInvite = async () => {
    if (!emailToInvite.trim()) return;

    setIsSendingInvite(true);
    try {
      const response = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listId: list.id,
          email: emailToInvite.trim(),
        }),
      });

      if (response.ok) {
        alert("Invitation sent successfully!");
        setEmailToInvite("");
        setIsShareDialogOpen(false);
      } else {
        const { error } = await response.json();
        alert("Error sending invitation: " + error);
      }
    } catch (error) {
      console.error("Error sending invitation:", error);
      alert("Error sending invitation. Please try again.");
    } finally {
      setIsSendingInvite(false);
    }
  };

  const copyInviteLink = () => {
    const inviteLink = `${window.location.origin}/join/${list.inviteCode}`;
    navigator.clipboard.writeText(inviteLink);
    alert("Invite link copied to clipboard!");
  };

  const copyInviteCode = () => {
    if (list.inviteCode) {
      navigator.clipboard.writeText(list.inviteCode);
    }
    alert("Invite code copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      {/* List Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-foreground">{list.name}</h1>
            <Badge variant={list.isShared ? "default" : "secondary"}>
              {list.isShared ? (
                <>
                  <Users className="h-3 w-3 mr-1" />
                  Shared
                </>
              ) : (
                <>
                  <Lock className="h-3 w-3 mr-1" />
                  Private
                </>
              )}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Owner: {list.owner.name}</span>
            {list.isShared && <span>{list.members.length + 1} members</span>}
            <span>{items.length} items</span>
          </div>
        </div>

        {list.isShared && (
          <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share List
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Shopping List</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Email Invitation */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Send Email Invitation
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="Enter email address"
                      value={emailToInvite}
                      onChange={(e) => setEmailToInvite(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendInvite}
                      disabled={isSendingInvite || !emailToInvite.trim()}
                    >
                      {isSendingInvite ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Mail className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Invite Link */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Invite Link</label>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={`${window.location.origin}/join/${list.inviteCode}`}
                      className="flex-1 bg-muted"
                    />
                    <Button variant="outline" onClick={copyInviteLink}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Invite Code */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Invite Code</label>
                  <div className="flex gap-2">
                    <Input
                      readOnly
                      value={list.inviteCode || ""}
                      className="flex-1 bg-muted font-mono"
                    />
                    <Button variant="outline" onClick={copyInviteCode}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Others can join by entering this code manually
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </motion.div>

      {/* Main Content */}
      <div
        className={`grid ${
          list.isShared ? "lg:grid-cols-2" : "grid-cols-1"
        } gap-6`}
      >
        {/* Items Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Shopping Items</h2>

            <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Item</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Item name (e.g., Milk)"
                    value={newItem.name}
                    onChange={(e) =>
                      setNewItem((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                  <Input
                    placeholder="Quantity (e.g., 2 bottles)"
                    value={newItem.quantity}
                    onChange={(e) =>
                      setNewItem((prev) => ({
                        ...prev,
                        quantity: e.target.value,
                      }))
                    }
                  />
                  <Input
                    placeholder="Description (optional)"
                    value={newItem.description}
                    onChange={(e) =>
                      setNewItem((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                  <select
                    className="w-full p-2 border border-border rounded-md bg-background"
                    value={newItem.category}
                    onChange={(e) =>
                      setNewItem((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select category (optional)</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <Button onClick={handleAddItem} className="w-full">
                    Add Item
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Items List */}
          <div className="space-y-3">
            <AnimatePresence>
              {items.map((item: ListItem) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onToggle={toggleItem}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteItem}
                />
              ))}
            </AnimatePresence>

            {items.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-muted-foreground"
              >
                <p>No items yet. Add your first item to get started!</p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Chat Section (Shared Lists Only) */}
        {list.isShared && (
          <EnhancedChat
            listId={list.id}
            messages={messages}
            items={items}
            currentUser={{
              id: user?.id || "",
              name: user?.fullName || user?.firstName || "User",
              email: user?.emailAddresses?.[0]?.emailAddress,
            }}
            onSendMessage={handleSendChatMessage}
            onStartTyping={handleStartTyping}
            onStopTyping={handleStopTyping}
            typingUsers={typingUsers}
            isConnected={isConnected}
          />
        )}
      </div>
    </div>
  );
}
