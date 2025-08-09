"use client";

// Socket.io Client Context for CartMate
// Provides real-time functionality throughout the app

import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useUser } from "@clerk/nextjs";

interface User {
  id: string;
  name: string;
  email?: string;
}

interface Message {
  id: string;
  content: string;
  userId: string;
  listId: string;
  createdAt: Date;
  replyToId?: string;
}

interface Item {
  id: string;
  name: string;
  quantity: string;
  description?: string;
  category?: string;
  isCompleted: boolean;
  addedById: string;
  completedById?: string;
  createdAt: Date;
  completedAt?: Date;
}

interface TypingEvent {
  user: User;
  isTyping: boolean;
}

interface ItemUpdateEvent {
  item: Item;
  action: "add" | "edit" | "delete" | "toggle";
  actor: User;
  timestamp: Date;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinList: (listId: string) => void;
  leaveList: (listId: string) => void;
  sendMessage: (listId: string, message: Message, user: User) => void;
  sendTypingStart: (listId: string, user: User) => void;
  sendTypingStop: (listId: string, user: User) => void;
  onItemUpdate: (
    callback: (data: ItemUpdateEvent) => void
  ) => (() => void) | undefined;
  onNewMessage: (callback: (data: Message) => void) => (() => void) | undefined;
  onUserJoined: (callback: (data: User) => void) => (() => void) | undefined;
  onUserLeft: (callback: (data: User) => void) => (() => void) | undefined;
  onUserTyping: (
    callback: (data: TypingEvent) => void
  ) => (() => void) | undefined;
  emitItemUpdate: (
    listId: string,
    item: Item,
    action: ItemUpdateEvent["action"],
    actor?: User
  ) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  joinList: () => {},
  leaveList: () => {},
  sendMessage: () => {},
  sendTypingStart: () => {},
  sendTypingStop: () => {},
  onItemUpdate: () => undefined,
  onNewMessage: () => undefined,
  onUserJoined: () => undefined,
  onUserLeft: () => undefined,
  onUserTyping: () => undefined,
  emitItemUpdate: () => {},
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !user) return;

    // Initialize socket connection
    const socketInstance = io(
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      {
        autoConnect: true,
      }
    );

    socketInstance.on("connect", () => {
      console.log("Connected to Socket.io server");
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from Socket.io server");
      setIsConnected(false);
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, [user, isLoaded]);

  const joinList = (listId: string) => {
    if (socket) {
      socket.emit("join-list", listId);
    }
  };

  const leaveList = (listId: string) => {
    if (socket) {
      socket.emit("leave-list", listId);
    }
  };

  const sendMessage = (listId: string, message: Message, user: User) => {
    if (socket) {
      socket.emit("send-message", { listId, message, user });
    }
  };

  const sendTypingStart = (listId: string, user: User) => {
    if (socket) {
      socket.emit("typing-start", { listId, user });
    }
  };

  const sendTypingStop = (listId: string, user: User) => {
    if (socket) {
      socket.emit("typing-stop", { listId, user });
    }
  };

  const emitItemUpdate = (
    listId: string,
    item: Item,
    action: ItemUpdateEvent["action"],
    actor?: User
  ) => {
    if (socket) {
      socket.emit("item-updated", { listId, item, action, actor });
    }
  };

  const onItemUpdate = (callback: (data: ItemUpdateEvent) => void) => {
    if (socket) {
      socket.on("item-updated", callback);
      return () => socket.off("item-updated", callback);
    }
  };

  const onNewMessage = (callback: (data: Message) => void) => {
    if (socket) {
      socket.on("new-message", callback);
      return () => socket.off("new-message", callback);
    }
  };

  const onUserJoined = (callback: (data: User) => void) => {
    if (socket) {
      socket.on("user-joined", callback);
      return () => socket.off("user-joined", callback);
    }
  };

  const onUserLeft = (callback: (data: User) => void) => {
    if (socket) {
      socket.on("user-left", callback);
      return () => socket.off("user-left", callback);
    }
  };

  const onUserTyping = (callback: (data: TypingEvent) => void) => {
    if (socket) {
      socket.on("user-typing", callback);
      return () => socket.off("user-typing", callback);
    }
  };

  const contextValue: SocketContextType = {
    socket,
    isConnected,
    joinList,
    leaveList,
    sendMessage,
    sendTypingStart,
    sendTypingStop,
    onItemUpdate,
    onNewMessage,
    onUserJoined,
    onUserLeft,
    onUserTyping,
    emitItemUpdate,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
}
