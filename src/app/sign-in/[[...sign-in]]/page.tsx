// Sign In Page for CartMate
// Clerk authentication with custom styling

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* App Branding */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-xl bg-primary">
            <span className="text-2xl text-primary-foreground font-bold">
              🛒
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Welcome to CartMate
          </h1>
          <p className="text-muted-foreground mt-2">
            Sign in to manage your shopping lists
          </p>
        </div>

        {/* Clerk Sign In Component */}
        <div className="flex justify-center">
          <SignIn
            appearance={{
              elements: {
                formButtonPrimary:
                  "bg-primary hover:bg-primary/90 text-primary-foreground",
                card: "bg-card border-border shadow-lg",
                headerTitle: "text-foreground",
                headerSubtitle: "text-muted-foreground",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
