import type { Metadata } from "next";
import { Poppins, Roboto_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { SocketProvider } from "@/contexts/socket-context";
import "./globals.css";

// Load custom fonts for CartMate theme
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "CartMate - Collaborative Shopping Lists",
  description:
    "Simple shopping lists that work like WhatsApp groups. Create, share, and collaborate on shopping lists in real-time.",
  keywords: ["shopping list", "collaboration", "real-time", "grocery", "cart"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${poppins.variable} ${robotoMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <SocketProvider>{children}</SocketProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
