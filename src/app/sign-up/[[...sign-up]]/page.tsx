// Sign Up Page for CartMate
// Clerk authentication with custom styling

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
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
          <h1 className="text-2xl font-bold text-foreground">Join CartMate</h1>
          <p className="text-muted-foreground mt-2">
            Create your account to start sharing shopping lists
          </p>
        </div>

        {/* Clerk Sign Up Component */}
        <div className="flex justify-center">
          <SignUp
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
