// Clerk Authentication Middleware for CartMate
// Protects routes and handles authentication

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/", // Landing page
  "/sign-in(.*)", // Sign in pages
  "/sign-up(.*)", // Sign up pages
  "/api/webhooks/(.*)", // Webhook endpoints
]);

export default clerkMiddleware(async (auth, req) => {
  // Redirect to sign-in if accessing protected route while unauthenticated
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
