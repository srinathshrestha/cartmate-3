"use client";

// Main Navigation Component for CartMate
// Simple header with user menu and theme toggle

import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon, ShoppingCart } from "lucide-react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";

export function Navigation() {
  const { theme, setTheme } = useTheme();

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo and Title */}
        <motion.div
          className="flex items-center space-x-2"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
            <ShoppingCart className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">CartMate</h1>
            <p className="text-xs text-muted-foreground">Shopping Lists</p>
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="h-9 w-9"
          >
            <SunIcon className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <MoonIcon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* User Menu */}
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-9 w-9",
              },
            }}
          />
        </div>
      </div>
    </motion.header>
  );
}
