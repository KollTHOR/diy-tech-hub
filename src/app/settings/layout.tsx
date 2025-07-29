"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const settingsNavigation = [
  {
    name: "Profile",
    href: "/settings/profile",
    description: "Manage your public profile information",
  },
  {
    name: "Connected Accounts",
    href: "/settings/accounts",
    description: "Manage your authentication methods",
  },
  {
    name: "Preferences",
    href: "/settings/preferences",
    description: "Customize your experience",
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-2">
                {settingsNavigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "block px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    )}
                  >
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {item.description}
                    </div>
                  </Link>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">{children}</div>
      </div>
    </div>
  );
}
