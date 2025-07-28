import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-2">
                <Link
                  href="/settings/accounts"
                  className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors"
                >
                  Connected Accounts
                </Link>
                <Link
                  href="/settings/profile"
                  className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors"
                >
                  Profile
                </Link>
                <Link
                  href="/settings/preferences"
                  className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-muted transition-colors"
                >
                  Preferences
                </Link>
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="md:col-span-3">{children}</div>
      </div>
    </div>
  );
}
