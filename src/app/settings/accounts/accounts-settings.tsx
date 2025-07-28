"use client";

import { useSession, signOut } from "next-auth/react";
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useConfirmationDialog } from "@/hooks/use-confirmation-dialog";
import { toast } from "sonner";

interface LinkedAccount {
  provider: string;
  email?: string;
  linkedAt: string;
}

interface UserAuthMethods {
  hasPassword: boolean;
  oauthProviders: string[];
  email: string;
}

export default function AccountsSettings() {
  const { data: session } = useSession();
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [userAuthMethods, setUserAuthMethods] =
    useState<UserAuthMethods | null>(null);
  const [loading, setLoading] = useState(true);
  const { confirm, dialogProps } = useConfirmationDialog();

  useEffect(() => {
    if (session?.user?.id) {
      fetchLinkedAccounts();
      fetchUserAuthMethods();
    }
  }, [session]);

  // Handle welcome message from OAuth-only error flow
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("welcome") === "true") {
      toast.success(
        "Welcome! You can now add a password to your account for additional sign-in options."
      );
      // Clear the URL parameter
      window.history.replaceState({}, "", "/settings/accounts");
    }
    if (urlParams.get("password-added") === "true") {
      toast.success(
        "Password added successfully! You now have multiple sign-in options."
      );
      // Clear the URL parameter
      window.history.replaceState({}, "", "/settings/accounts");
    }
  }, []);

  const fetchLinkedAccounts = async () => {
    try {
      const response = await fetch("/api/user/linked-accounts");
      if (response.ok) {
        const data = await response.json();
        setLinkedAccounts(data.accounts);
      }
    } catch (error) {
      console.error("Failed to fetch linked accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAuthMethods = async () => {
    if (!session?.user?.email) return;

    try {
      const response = await fetch("/api/check-user-auth-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserAuthMethods(data);
      }
    } catch (error) {
      console.error("Failed to fetch user auth methods:", error);
    }
  };

  const linkAccount = async (provider: string) => {
    try {
      const result = await signIn(provider, {
        redirect: false,
        callbackUrl: "/settings/accounts?linked=true",
      });

      if (result?.ok) {
        toast.success(`${provider} account linked successfully!`);
        fetchLinkedAccounts();
        fetchUserAuthMethods();
      } else if (result?.error) {
        toast.error("Failed to link account: " + result.error);
      }
    } catch (error) {
      toast.error("Failed to link account");
    }
  };

  const unlinkAccount = async (provider: string) => {
    const providerName = provider === "google" ? "Google" : "GitHub";

    const confirmed = await confirm({
      title: `Unlink ${providerName} Account`,
      description: `Are you sure you want to unlink your ${providerName} account? You may need to sign in again if this is your current authentication method.`,
      confirmText: "Unlink Account",
      cancelText: "Keep Connected",
      variant: "destructive",
    });

    if (!confirmed) return;

    try {
      const response = await fetch("/api/user/unlink-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`${providerName} account unlinked successfully`);

        if (data.forceSignOut) {
          toast.info("Signing you out for security. Please sign in again.");

          setTimeout(() => {
            signOut({ callbackUrl: "/login?message=account-unlinked" });
          }, 2000);
        } else {
          fetchLinkedAccounts();
          fetchUserAuthMethods();
        }
      } else {
        toast.error(data.error || "Failed to unlink account");
      }
    } catch (error) {
      toast.error("Failed to unlink account");
    }
  };

  const isLinked = (provider: string) =>
    linkedAccounts.some((acc) => acc.provider === provider);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Connected Accounts</h1>
          <p className="text-muted-foreground">
            Manage your linked social accounts for easy sign-in
          </p>
        </div>

        <Alert>
          <AlertDescription>
            <strong>Security Note:</strong> If you unlink your current
            authentication method, you&apos;ll be signed out and need to sign in
            again with a remaining method.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Social Accounts</CardTitle>
            <CardDescription>
              Link your social accounts to sign in with multiple methods
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Google Account */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <svg className="h-6 w-6" viewBox="0 0 24 24">
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
                <div>
                  <div className="font-medium">Google</div>
                  <div className="text-sm text-muted-foreground">
                    {isLinked("google") ? "Connected" : "Not connected"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isLinked("google") && (
                  <Badge variant="secondary">Connected</Badge>
                )}
                {isLinked("google") ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => unlinkAccount("google")}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => linkAccount("google")}>
                    Connect
                  </Button>
                )}
              </div>
            </div>

            {/* GitHub Account */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <svg
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
                <div>
                  <div className="font-medium">GitHub</div>
                  <div className="text-sm text-muted-foreground">
                    {isLinked("github") ? "Connected" : "Not connected"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isLinked("github") && (
                  <Badge variant="secondary">Connected</Badge>
                )}
                {isLinked("github") ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => unlinkAccount("github")}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => linkAccount("github")}>
                    Connect
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Password Section - Only show if user doesn't have a password */}
        {session?.user?.email &&
          userAuthMethods &&
          !userAuthMethods.hasPassword && (
            <Card>
              <CardHeader>
                <CardTitle>Password Authentication</CardTitle>
                <CardDescription>
                  Add a password to your account for additional sign-in options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/add-password">Add Password to Account</Link>
                </Button>
              </CardContent>
            </Card>
          )}
      </div>

      {/* Render the confirmation dialog */}
      {dialogProps && <ConfirmationDialog {...dialogProps} />}
    </>
  );
}
