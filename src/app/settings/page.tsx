"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();

  // Redirect to profile settings by default
  useEffect(() => {
    router.replace("/settings/profile");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
    </div>
  );
}
