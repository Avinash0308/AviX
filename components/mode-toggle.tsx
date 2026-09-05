"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="w-9 h-9 rounded-full border border-black/10 dark:border-white/10"
        aria-label="Toggle theme"
      >
        <Sun className="h-4 w-4 opacity-50" />
      </Button>
    );
  }

  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative w-9 h-9 rounded-full border border-black/10 dark:border-white/10 bg-white/50 dark:bg-slate-900/50 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all hover:scale-105 active:scale-95"
      aria-label="Toggle theme"
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-violet-400" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
