"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface OAuthOnlyError {
  type: string;
  email: string;
  providers: string[];
}

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [oauthOnlyError, setOauthOnlyError] = useState<OAuthOnlyError | null>(
    null
  );
  const [socialSignInLoading, setSocialSignInLoading] = useState<string | null>(
    null
  );
  const router = useRouter();

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setOauthOnlyError(null);

    try {
      console.log("🔄 Attempting credentials sign in...");
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        try {
          const errorData = JSON.parse(result.error);
          if (errorData.type === "OAuthOnlyAccount") {
            setOauthOnlyError(errorData);
            return;
          }
        } catch {
          // Not a JSON error, handle as normal
        }

        toast.error("Invalid email or password");
      } else {
        toast.success("Logged in successfully!");
        setTimeout(() => {
          window.location.href = "/"; // Use window.location instead of router
        }, 1000);
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (
    provider: string,
    redirectToSettings = false
  ) => {
    setSocialSignInLoading(provider);

    try {
      const callbackUrl = redirectToSettings
        ? "/settings/accounts?welcome=true"
        : "/";

      const result = await signIn(provider, {
        callbackUrl,
        redirect: false,
      });

      if (result?.error === "OAuthAccountNotLinked") {
        const email = result.url?.includes("email=")
          ? decodeURIComponent(result.url.split("email=")[1].split("&")[0])
          : "unknown";

        window.location.href = `/login/error?error=OAuthAccountNotLinked&email=${encodeURIComponent(
          email
        )}&provider=${provider}`;
      } else if (result?.error) {
        toast.error("Sign in failed: " + result.error);
      } else if (result?.ok) {
        if (redirectToSettings) {
          toast.success(
            "Signed in successfully! Redirecting to account settings..."
          );
        }
        window.location.href = result.url || callbackUrl;
      }
    } catch (error) {
      console.error("Social login error:", error);
      toast.error("Something went wrong during sign in");
    } finally {
      setSocialSignInLoading(null);
    }
  };

  const clearOAuthError = () => {
    setOauthOnlyError(null);
    setEmail("");
    setPassword("");
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Sign in</CardTitle>
          <CardDescription className="text-center">
            {oauthOnlyError
              ? "Account found! Please sign in with your existing method"
              : "Choose your preferred sign-in method"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Enhanced OAuth-only Account Error */}
          {oauthOnlyError && (
            <div className="space-y-4">
              <Alert className="border-blue-200 bg-blue-50">
                
                <AlertDescription>
                  <div className="space-y-3 text-blue-900">
                    <p>
                      We found an existing account for{" "}
                      <strong>{oauthOnlyError.email}</strong>, but it was
                      created using social login.
                    </p>

                    <div>
                      <p className="text-sm font-medium mb-2">
                        Available sign-in methods:
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {oauthOnlyError.providers.map((provider) => (
                          <Badge
                            key={provider}
                            variant="secondary"
                            className="bg-blue-100 text-blue-800"
                          >
                            {provider === "google" ? "Google" : "GitHub"}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <p className="text-sm text-center text-muted-foreground font-medium">
                  Sign in with your existing method to access your account:
                </p>

                <div className="space-y-2">
                  {oauthOnlyError.providers.includes("google") && (
                    <Button
                      variant="outline"
                      onClick={() => handleSocialLogin("google", true)}
                      className="w-full justify-items-center-safe"
                      disabled={socialSignInLoading === "google"}
                    >
                      {socialSignInLoading === "google" ? (
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
                      ) : (
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
                      )}
                      Continue with Google
                    </Button>
                  )}

                  {oauthOnlyError.providers.includes("github") && (
                    <Button
                      variant="outline"
                      onClick={() => handleSocialLogin("github", true)}
                      className="w-full justify-start"
                      disabled={socialSignInLoading === "github"}
                    >
                      {socialSignInLoading === "github" ? (
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
                      ) : (
                        <svg
                          className="mr-2 h-4 w-4"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                        </svg>
                      )}
                      Continue with GitHub
                    </Button>
                  )}
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-start">
                    <svg
                      className="h-5 w-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="text-sm text-amber-800">
                      <p className="font-medium mb-1">
                        Want to add a password?
                      </p>
                      <p>
                        After signing in, you&apos;ll be taken to your account
                        settings where you can add a password for additional
                        sign-in options.
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  onClick={clearOAuthError}
                  size="sm"
                  className="w-full"
                >
                  Try different email
                </Button>
              </div>
            </div>
          )}

          {/* Only show social login and email form if no OAuth-only error */}
          {!oauthOnlyError && (
            <>
              {/* Social Login Buttons */}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => handleSocialLogin("google")}
                  className="w-full"
                  disabled={socialSignInLoading === "google"}
                >
                  {socialSignInLoading === "google" ? (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
                  ) : (
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
                  )}
                  Google
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleSocialLogin("github")}
                  className="w-full"
                  disabled={socialSignInLoading === "github"}
                >
                  {socialSignInLoading === "github" ? (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
                  ) : (
                    <svg
                      className="mr-2 h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                    </svg>
                  )}
                  GitHub
                </Button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
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
                  {isLoading ? "Signing in..." : "Sign in with Email"}
                </Button>
              </form>
            </>
          )}

          <div className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
