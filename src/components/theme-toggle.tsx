"use client";

import { Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check for saved theme preference or default to 'light'
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark);
    setIsDark(shouldBeDark);

    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);

    if (newTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">Theme</span>
        <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-muted">
          <div className="h-4 w-4 rounded-full bg-background border shadow-sm" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={toggleTheme}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background cursor-pointer",
          isDark ? "bg-primary" : "bg-muted"
        )}
        role="switch"
        aria-checked={isDark}
        aria-label="Toggle theme"
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-background shadow-lg ring-0 transition-transform duration-200 ease-in-out",
            isDark ? "translate-x-6" : "translate-x-1"
          )}
        >
          <div className="flex h-full w-full items-center justify-center">
            {isDark ? (
              <Moon className="h-2.5 w-2.5 text-foreground" />
            ) : (
              <Sun className="h-2.5 w-2.5 text-foreground" />
            )}
          </div>
        </span>
      </button>
    </div>
  );
}
