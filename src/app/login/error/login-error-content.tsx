"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface UserAuthMethods {
  hasPassword: boolean;
  oauthProviders: string[];
  email: string;
}

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const email = searchParams.get("email");
  const attemptedProvider = searchParams.get("provider");

  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userMethods, setUserMethods] = useState<UserAuthMethods | null>(null);
  const [fetchingMethods, setFetchingMethods] = useState(true);

  // Fetch user's existing authentication methods
  useEffect(() => {
    if (email && error === "OAuthAccountNotLinked") {
      fetchUserAuthMethods();
    }
  }, [email, error]);

  const fetchUserAuthMethods = async () => {
    try {
      const response = await fetch("/api/check-user-auth-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserMethods(data);
      }
    } catch (error) {
      console.error("Failed to fetch user auth methods:", error);
    } finally {
      setFetchingMethods(false);
    }
  };

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Invalid password. Please try again.");
      } else {
        toast.success("Signed in successfully! Linking accounts...");
        // The user is now logged in, we can link the OAuth account
        await linkOAuthAccount();
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const linkOAuthAccount = async () => {
    try {
      // Trigger the OAuth flow again, now that user is authenticated
      const result = await signIn(attemptedProvider!, {
        redirect: true,
        callbackUrl: "/",
      });
    } catch (error) {
      toast.error("Failed to link account");
    }
  };

  const handleExistingOAuthSignIn = async (provider: string) => {
    try {
      await signIn(provider, { callbackUrl: "/" });
    } catch (error) {
      toast.error("Sign in failed");
    }
  };

  if (error !== "OAuthAccountNotLinked") {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Error</CardTitle>
            <CardDescription>
              Something went wrong during sign in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/login">Try Again</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (fetchingMethods) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Account Already Exists</CardTitle>
          <CardDescription>
            This email is already associated with an account using different
            sign-in methods.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              <div className="space-y-2">
                <div>
                  <strong>Email:</strong> {email}
                </div>
                <div>
                  <strong>Attempted method:</strong> {attemptedProvider}
                </div>
                {userMethods && (
                  <div>
                    <strong>Existing methods:</strong>
                    <div className="flex gap-2 mt-1">
                      {userMethods.hasPassword && (
                        <Badge variant="secondary">Email/Password</Badge>
                      )}
                      {userMethods.oauthProviders.map((provider) => (
                        <Badge key={provider} variant="secondary">
                          {provider === "google" ? "Google" : "GitHub"}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            {/* Show password option only if user has a password */}
            {userMethods?.hasPassword ? (
              <div>
                <h4 className="font-medium mb-2">
                  Option 1: Sign in with your password
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Enter your password to sign in and we&apos;ll link your{" "}
                  {attemptedProvider} account.
                </p>

                <form onSubmit={handlePasswordSignIn} className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign in and Link Accounts"}
                  </Button>
                </form>
              </div>
            ) : (
              <Alert>
                <AlertDescription>
                  This account was created using social login only and doesn&apos;t
                  have a password.
                </AlertDescription>
              </Alert>
            )}

            {/* Show existing OAuth providers */}
            {userMethods?.oauthProviders &&
              userMethods.oauthProviders.length > 0 && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        {userMethods.hasPassword ? "or" : "Please"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">
                      {userMethods.hasPassword ? "Option 2: " : ""}Sign in with
                      existing method
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Use one of your existing sign-in methods, then we&apos;ll link
                      your {attemptedProvider} account.
                    </p>

                    <div className="space-y-2">
                      {userMethods.oauthProviders.includes("google") && (
                        <Button
                          variant="outline"
                          onClick={() => handleExistingOAuthSignIn("google")}
                          className="w-full"
                        >
                          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                            <path
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              fill="#4285F4"
                            />
                            <path
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              fill="#34A853"
                            />
                            <path
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                              fill="#FBBC05"
                            />
                            <path
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                              fill="#EA4335"
                            />
                          </svg>
                          Continue with Google
                        </Button>
                      )}

                      {userMethods.oauthProviders.includes("github") && (
                        <Button
                          variant="outline"
                          onClick={() => handleExistingOAuthSignIn("github")}
                          className="w-full"
                        >
                          <svg
                            className="mr-2 h-4 w-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                          </svg>
                          Continue with GitHub
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              )}

            {/* Password reset option (only if user has password) */}
            {userMethods?.hasPassword && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      or
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">
                    Option 3: Reset your password
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    If you forgot your password, reset it and then link your
                    accounts.
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/forgot-password?email=${email}`}>
                      Reset Password
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </div>

          <div className="pt-4 border-t">
            <Button asChild variant="ghost" className="w-full">
              <Link href="/login">Back to Sign In</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
