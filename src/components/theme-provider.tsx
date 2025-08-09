"use client";

// Theme Provider for CartMate
// Handles light/dark theme switching with custom colors

import * as React from "react";
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps as NextThemeProviderProps,
} from "next-themes";

type ThemeProviderProps = Omit<
  NextThemeProviderProps,
  "attribute" | "value"
> & {
  attribute?: "class" | "data-theme";
  value?: Record<string, string>;
};

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
