"use client";

// Theme Provider for CartMate
// Handles light/dark theme switching with custom colors

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: string;
  storageKey?: string;
  attribute?: string;
  value?: { [x: string]: any };
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
};

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
