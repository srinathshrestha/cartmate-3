"use client";

// Enhanced Item Card Component
// Supports editing, deleting, with smooth animations

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CheckCircle2,
  Edit3,
  Trash2,
  MoreVertical,
  Save,
  X,
  User,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email?: string;
}

interface Item {
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

interface ItemCardProps {
  item: Item;
  onToggle: (itemId: string) => void;
  onEdit: (itemId: string, data: EditItemData) => void;
  onDelete: (itemId: string) => void;
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

export function ItemCard({ item, onToggle, onEdit, onDelete }: ItemCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editData, setEditData] = useState({
    name: item.name,
    quantity: item.quantity,
    description: item.description || "",
    category: item.category || "",
  });

  const handleEdit = () => {
    if (!editData.name.trim() || !editData.quantity.trim()) return;

    onEdit(item.id, editData);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditData({
      name: item.name,
      quantity: item.quantity,
      description: item.description || "",
      category: item.category || "",
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(item.id);
    setIsDeleteDialogOpen(false);
  };

  const cardVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 24,
      },
    },
    exit: {
      opacity: 0,
      x: -100,
      scale: 0.95,
      transition: {
        duration: 0.2,
      },
    },
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 },
    },
  };

  const checkboxVariants = {
    checked: { scale: 1.1, rotate: 360 },
    unchecked: { scale: 1, rotate: 0 },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover="hover"
      layout
    >
      <Card
        className={`shopping-item-card relative overflow-hidden ${
          item.isCompleted ? "opacity-60" : ""
        }`}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Checkbox */}
            <motion.div
              variants={checkboxVariants}
              animate={item.isCompleted ? "checked" : "unchecked"}
              className="mt-1"
            >
              <Checkbox
                checked={item.isCompleted}
                onCheckedChange={() => onToggle(item.id)}
                className="h-5 w-5"
              />
            </motion.div>

            <div className="flex-1 space-y-2">
              {isEditing ? (
                // Edit Mode
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <div className="flex gap-2">
                    <Input
                      value={editData.name}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Item name"
                      className="flex-1"
                    />
                    <Input
                      value={editData.quantity}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          quantity: e.target.value,
                        }))
                      }
                      placeholder="Quantity"
                      className="w-32"
                    />
                  </div>
                  <Input
                    value={editData.description}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Description (optional)"
                  />
                  <select
                    className="w-full p-2 border border-border rounded-md bg-background text-sm"
                    value={editData.category}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                  >
                    <option value="">No category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <Button onClick={handleEdit} size="sm" className="flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              ) : (
                // View Mode
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <h3
                        className={`font-medium text-sm ${
                          item.isCompleted ? "line-through" : ""
                        }`}
                      >
                        {item.name} ({item.quantity})
                      </h3>
                      {item.category && (
                        <Badge variant="outline" className="text-xs">
                          {item.category}
                        </Badge>
                      )}
                    </div>

                    {/* Actions Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setIsEditing(true)}>
                          <Edit3 className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setIsDeleteDialogOpen(true)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {item.description && (
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  )}

                  {/* Activity Info */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>Added by {item.addedBy.name}</span>
                    </div>
                    {item.isCompleted && item.completedBy && (
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>✓ by {item.completedBy.name}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </CardContent>

        {/* Completion indicator */}
        {item.isCompleted && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-0 left-0 h-1 bg-primary"
          />
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to delete &quot;{item.name}&quot;? This
              action cannot be undone.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={handleDelete}
                variant="destructive"
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              <Button
                onClick={() => setIsDeleteDialogOpen(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
