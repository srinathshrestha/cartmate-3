"use client";

// Enhanced Chat Component
// Supports replies, typing indicators, item mentions, and smooth animations

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageCircle,
  Send,
  Reply,
  AtSign,
  MoreVertical,
  X,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email?: string;
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

interface EnhancedChatProps {
  listId: string;
  messages: ChatMessage[];
  items: ListItem[];
  currentUser: User;
  onSendMessage: (message: string, replyTo?: ChatMessage) => void;
  onStartTyping: () => void;
  onStopTyping: () => void;
  typingUsers: User[];
  isConnected: boolean;
}

export function EnhancedChat({
  messages,
  items,
  onSendMessage,
  onStartTyping,
  onStopTyping,
  typingUsers,
  isConnected,
}: EnhancedChatProps) {
  const [chatMessage, setChatMessage] = useState("");
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [showItemMentions, setShowItemMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputChange = (value: string) => {
    setChatMessage(value);

    // Handle typing indicators
    if (value.trim() && !typingTimeoutRef.current) {
      onStartTyping();
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      onStopTyping();
      typingTimeoutRef.current = null;
    }, 1000);

    // Handle item mentions
    const lastAtIndex = value.lastIndexOf("@");
    if (lastAtIndex !== -1 && lastAtIndex === value.length - 1) {
      setShowItemMentions(true);
      setMentionQuery("");
    } else if (lastAtIndex !== -1) {
      const query = value.slice(lastAtIndex + 1);
      if (query.includes(" ")) {
        setShowItemMentions(false);
      } else {
        setMentionQuery(query);
        setShowItemMentions(true);
      }
    } else {
      setShowItemMentions(false);
    }
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return;

    onSendMessage(chatMessage.trim(), replyTo || undefined);
    setChatMessage("");
    setReplyTo(null);
    setShowItemMentions(false);

    // Stop typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    onStopTyping();
  };

  const handleItemMention = (item: ListItem) => {
    const lastAtIndex = chatMessage.lastIndexOf("@");
    const beforeMention = chatMessage.slice(0, lastAtIndex);
    const afterMention = `@${item.name} `;
    setChatMessage(beforeMention + afterMention);
    setShowItemMentions(false);
    inputRef.current?.focus();
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(mentionQuery.toLowerCase())
  );

  const messageVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24,
      },
    },
  };

  const typingVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: "auto" },
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4 h-full flex flex-col"
    >
      <h2 className="text-xl font-semibold flex items-center gap-2">
        <MessageCircle className="h-5 w-5" />
        Group Chat
        {!isConnected && (
          <Badge variant="destructive" className="text-xs">
            Disconnected
          </Badge>
        )}
      </h2>

      <Card className="flex-1 flex flex-col h-[500px] min-h-0">
        <CardHeader className="pb-3 flex-shrink-0">
          <CardTitle className="text-sm text-muted-foreground">
            Chat with list members
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-4 pt-0 min-h-0 overflow-hidden">
          {/* Reply Banner */}
          <AnimatePresence>
            {replyTo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-muted p-3 rounded-lg mb-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Reply className="h-4 w-4" />
                  <span className="text-sm">
                    Replying to <strong>{replyTo.user.name}</strong>: &quot;
                    {replyTo.message}&quot;
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyTo(null)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages Area */}
          <div className="flex-1 space-y-3 mb-4 overflow-y-auto min-h-0 max-h-none pr-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-muted-foreground text-sm py-8"
              >
                No messages yet. Start the conversation!
              </motion.div>
            ) : (
              <AnimatePresence>
                {messages.map((msg: ChatMessage, index: number) => (
                  <motion.div
                    key={msg.id || index}
                    variants={messageVariants}
                    initial="hidden"
                    animate="visible"
                    className="group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        {/* Reply context */}
                        {msg.replyTo && (
                          <div className="bg-muted/50 p-2 rounded-lg mb-2 text-xs">
                            <div className="flex items-center gap-1 mb-1">
                              <Reply className="h-3 w-3" />
                              <span className="font-medium">
                                {msg.replyTo.user.name}
                              </span>
                            </div>
                            <p className="opacity-75">{msg.replyTo.message}</p>
                          </div>
                        )}

                        <div className="chat-message">
                          <p className="text-sm">
                            {msg.message
                              .split(/(@\w+)/)
                              .map((part: string, i: number) => {
                                if (part.startsWith("@")) {
                                  const itemName = part.slice(1);
                                  const mentionedItem = items.find(
                                    (item) =>
                                      item.name.toLowerCase() ===
                                      itemName.toLowerCase()
                                  );
                                  return mentionedItem ? (
                                    <Badge
                                      key={i}
                                      variant="secondary"
                                      className="text-xs mx-1"
                                    >
                                      {part}
                                    </Badge>
                                  ) : (
                                    part
                                  );
                                }
                                return part;
                              })}
                          </p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                            <span>{msg.user.name}</span>
                            <div className="flex items-center gap-2">
                              <span>
                                {new Date(msg.createdAt).toLocaleTimeString()}
                              </span>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <MoreVertical className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => setReplyTo(msg)}
                                  >
                                    <Reply className="h-4 w-4 mr-2" />
                                    Reply
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {/* Typing Indicators */}
            <AnimatePresence>
              {typingUsers.length > 0 && (
                <motion.div
                  variants={typingVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  <div className="flex space-x-1">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                      className="w-1 h-1 bg-primary rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: 0.2,
                      }}
                      className="w-1 h-1 bg-primary rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: 0.4,
                      }}
                      className="w-1 h-1 bg-primary rounded-full"
                    />
                  </div>
                  <span>
                    {typingUsers.map((u) => u.name).join(", ")}
                    {typingUsers.length === 1 ? " is" : " are"} typing...
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>

          {/* Item Mentions Dropdown */}
          <AnimatePresence>
            {showItemMentions && filteredItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-card border border-border rounded-lg p-2 mb-2 max-h-32 overflow-y-auto"
              >
                {filteredItems.slice(0, 5).map((item: ListItem) => (
                  <motion.button
                    key={item.id}
                    whileHover={{ backgroundColor: "var(--muted)" }}
                    onClick={() => handleItemMention(item)}
                    className="w-full text-left p-2 rounded text-sm hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <AtSign className="h-3 w-3" />
                      <span>{item.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {item.quantity}
                      </Badge>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Message Input */}
          <div className="flex gap-2 flex-shrink-0">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                placeholder="Type a message... (use @ to mention items)"
                value={chatMessage}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                disabled={!isConnected}
                className="pr-12"
              />
              {chatMessage.includes("@") && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-12 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setShowItemMentions(!showItemMentions)}
                >
                  <AtSign className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button
              onClick={handleSendMessage}
              size="icon"
              disabled={!chatMessage.trim() || !isConnected}
              className="shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
