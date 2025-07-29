"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Session } from "next-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

interface ProfileFormProps {
  session: Session;
}

interface UserProfile {
  name: string;
  email: string;
  bio?: string;
  website?: string;
  location?: string;
  hasPassword: boolean;
  oauthProviders: string[];
  createdAt: string;
}

export default function ProfileForm({ session }: ProfileFormProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Form state
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");

  // Fetch user profile on component mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data);

        // Set form fields
        setName(data.name || "");
        setBio(data.bio || "");
        setWebsite(data.website || "");
        setLocation(data.location || "");
      } else {
        toast.error("Failed to load profile");
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      toast.error("Something went wrong");
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          bio: bio.trim(),
          website: website.trim(),
          location: location.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Profile updated successfully!");
        setProfile(data.user);
        router.refresh();
      } else {
        toast.error(data.error || "Failed to update profile");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Failed to load profile information.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.reload()} className="w-full">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Account Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            Your account details and authentication methods
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Email</Label>
              <div className="text-sm text-muted-foreground mt-1">
                {profile.email}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Member Since</Label>
              <div className="text-sm text-muted-foreground mt-1">
                {new Date(profile.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">
              Authentication Methods
            </Label>
            <div className="flex gap-2 flex-wrap">
              {profile.hasPassword && (
                <Badge variant="secondary">Email/Password</Badge>
              )}
              {profile.oauthProviders.map((provider) => (
                <Badge key={provider} variant="secondary">
                  {provider === "google" ? "Google" : "GitHub"}
                </Badge>
              ))}
            </div>
          </div>

          <Alert>
            <AlertDescription>
              To manage your authentication methods, visit{" "}
              <Button variant="link" asChild className="p-0 h-auto">
                <a href="/settings/accounts">Connected Accounts</a>
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>Public Profile</CardTitle>
          <CardDescription>
            This information will be visible to other users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your display name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
              />
              <div className="text-xs text-muted-foreground">
                {name.length}/50 characters
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us a bit about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={500}
                rows={4}
              />
              <div className="text-xs text-muted-foreground">
                {bio.length}/500 characters
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://your-website.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  maxLength={200}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="City, Country"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  maxLength={100}
                />
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Updating Profile..." : "Update Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
