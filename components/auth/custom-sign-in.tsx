"use client";

import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export const CustomSignIn = () => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Skeleton loader while theme resolves to prevent flash
    return (
      <div className="w-full max-w-[420px] h-[520px] rounded-2xl bg-card border border-border/60 animate-pulse" />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <SignIn
      appearance={{
        baseTheme: isDark ? dark : undefined,
        layout: {
          socialButtonsPlacement: "top",
          logoPlacement: "none",
        },
        variables: {
          colorPrimary: "#8B5CF6",
          borderRadius: "0.875rem",
          colorBackground: isDark ? "#09090b" : "#ffffff",
          colorInputBackground: isDark ? "#18181b" : "#f4f4f5",
          colorInputText: isDark ? "#ffffff" : "#09090b",
          colorText: isDark ? "#ffffff" : "#09090b",
          colorTextSecondary: isDark ? "#a1a1aa" : "#71717a",
        },
        elements: {
          rootBox: "w-full max-w-[420px] mx-auto",
          cardBox: isDark
            ? "shadow-2xl rounded-2xl overflow-hidden border border-white/10 w-full"
            : "shadow-xl rounded-2xl overflow-hidden border border-black/10 w-full",
          card: isDark
            ? "bg-zinc-950/95 backdrop-blur-2xl shadow-none p-6 sm:p-8"
            : "bg-white shadow-none p-6 sm:p-8",
          footer: isDark
            ? "bg-zinc-950/95 border-t border-white/10"
            : "bg-zinc-50 border-t border-black/10",
          headerTitle: isDark
            ? "text-white font-extrabold text-xl sm:text-2xl tracking-tight text-center"
            : "text-zinc-900 font-extrabold text-xl sm:text-2xl tracking-tight text-center",
          headerSubtitle: isDark
            ? "text-zinc-400 text-xs sm:text-sm text-center mt-1"
            : "text-zinc-500 text-xs sm:text-sm text-center mt-1",
          formButtonPrimary:
            "bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white font-semibold rounded-xl shadow-md shadow-violet-500/25 active:scale-[0.99] transition-all py-2.5 cursor-pointer",
          socialButtonsBlockButton: isDark
            ? "border border-white/15 hover:bg-white/5 text-white font-medium rounded-xl transition-all py-2.5 cursor-pointer"
            : "border border-black/10 hover:bg-black/5 text-zinc-900 font-medium rounded-xl transition-all py-2.5 cursor-pointer",
          socialButtonsBlockButtonText: isDark
            ? "text-white font-medium text-xs sm:text-sm"
            : "text-zinc-900 font-medium text-xs sm:text-sm",
          dividerLine: isDark ? "bg-white/10" : "bg-black/10",
          dividerText: isDark
            ? "text-zinc-400 text-xs font-medium uppercase tracking-wider"
            : "text-zinc-500 text-xs font-medium uppercase tracking-wider",
          formFieldLabel: isDark
            ? "text-zinc-200 font-medium text-xs"
            : "text-zinc-700 font-medium text-xs",
          formFieldInput: isDark
            ? "bg-zinc-900/80 border-white/15 focus:border-violet-500 text-white rounded-xl transition-all px-3 py-2 text-sm"
            : "bg-zinc-100/80 border-black/10 focus:border-violet-500 text-zinc-900 rounded-xl transition-all px-3 py-2 text-sm",
          footerActionLink: isDark
            ? "text-violet-400 hover:text-violet-300 font-semibold text-xs sm:text-sm"
            : "text-violet-600 hover:text-violet-700 font-semibold text-xs sm:text-sm",
          footerActionText: isDark ? "text-zinc-400 text-xs sm:text-sm" : "text-zinc-500 text-xs sm:text-sm",
          identityPreviewText: isDark ? "text-white font-medium text-sm" : "text-zinc-900 font-medium text-sm",
          identityPreviewEditButton: isDark
            ? "text-violet-400 hover:text-violet-300 text-xs font-semibold"
            : "text-violet-600 hover:text-violet-700 text-xs font-semibold",
        },
      }}
    />
  );
};
