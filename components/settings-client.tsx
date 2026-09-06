"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { useUser, useClerk } from "@clerk/nextjs";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Settings,
  Zap,
  Check,
  Sun,
  Moon,
  Laptop,
  User,
  Download,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Cpu,
  Loader2,
} from "lucide-react";

import { Heading } from "@/components/heading";
import { SubscriptionButton } from "@/components/subscription-button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface SettingsClientProps {
  isPro: boolean;
  apiLimitCount: number;
  maxFreeCounts: number;
}

export const SettingsClient = ({
  isPro = false,
  apiLimitCount = 0,
  maxFreeCounts = 20,
}: SettingsClientProps) => {
  const { theme, setTheme } = useTheme();
  const { user } = useUser();
  const { openUserProfile } = useClerk();

  const [isExporting, setIsExporting] = useState(false);

  // Handle Export Conversations
  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const response = await axios.get("/api/chat/history");
      const conversations = response.data || [];

      if (conversations.length === 0) {
        toast("No chat conversations to export.", { icon: "ℹ️" });
        return;
      }

      const exportData = {
        exportedAt: new Date().toISOString(),
        user: user?.primaryEmailAddress?.emailAddress || user?.id,
        totalConversations: conversations.length,
        conversations,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `avix-conversations-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Conversation history exported successfully!");
    } catch (error) {
      console.error("[EXPORT_ERROR]", error);
      toast.error("Failed to export conversation history.");
    } finally {
      setIsExporting(false);
    }
  };

  const usagePercent = Math.min((apiLimitCount / maxFreeCounts) * 100, 100);

  return (
    <div className="h-full overflow-y-auto pt-6 sm:pt-8 pb-12">
      <div className="max-w-5xl mx-auto">
        <Heading
          title="Settings"
          description="Manage subscription, account security, and workspace preferences."
          icon={Settings}
          iconColor="text-violet-500"
          bgColor="bg-violet-500/10"
        />
      </div>

      <div className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
        {/* 1. Subscription & Usage Card */}
        <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-7 shadow-sm transition-all hover:border-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border/60">
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg sm:text-xl font-bold text-foreground">
                  Current Plan
                </h3>
                {isPro ? (
                  <Badge
                    variant="premium"
                    className="uppercase tracking-wider font-bold text-xs py-0.5 px-2"
                  >
                    Pro Active
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="uppercase tracking-wider font-semibold text-xs py-0.5 px-2"
                  >
                    Free Tier
                  </Badge>
                )}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {isPro
                  ? "You have full, unlimited access to all multimodal AI models."
                  : `You are on the free tier with a limit of ${maxFreeCounts} generations.`}
              </p>
            </div>

            <div className="shrink-0">
              <SubscriptionButton isPro={isPro} />
            </div>
          </div>

          {/* Usage Meter */}
          <div className="pt-5 space-y-3">
            <div className="flex justify-between items-center text-xs sm:text-sm">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-violet-500" />
                Monthly Generations Usage
              </span>
              <span className="text-muted-foreground font-medium">
                {isPro ? (
                  <span className="text-violet-500 font-semibold">Unlimited Access</span>
                ) : (
                  <span>
                    <strong className="text-foreground">{apiLimitCount}</strong> / {maxFreeCounts} used
                  </span>
                )}
              </span>
            </div>

            {!isPro && (
              <div className="space-y-1.5">
                <Progress
                  value={usagePercent}
                  className="h-2.5 bg-secondary rounded-full overflow-hidden"
                />
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>{maxFreeCounts - apiLimitCount > 0 ? `${maxFreeCounts - apiLimitCount} free remaining` : "Limit reached"}</span>
                  <span>{Math.round(usagePercent)}%</span>
                </div>
              </div>
            )}

            {/* Plan Perks Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground/85">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Omnimodal Studio (Text, Code, Photo, Music & Video)</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground/85">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Powered by Gemini 1.5 Pro & Imagen 3</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground/85">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>High-resolution media export</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-foreground/85">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{isPro ? "Priority queue processing" : "Standard queue processing"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Grid for Account & Appearance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 2. Account & Profile Card */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-violet-500" />
                <h3 className="text-base sm:text-lg font-bold text-foreground">
                  Account & Profile
                </h3>
              </div>

              <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-secondary/40 border border-border/50 mb-4">
                <Avatar className="h-12 w-12 border border-border shrink-0">
                  <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User Avatar"} />
                  <AvatarFallback className="font-bold text-sm bg-gradient-to-tr from-violet-600 to-pink-600 text-white">
                    {user?.firstName?.charAt(0) || user?.emailAddresses?.[0]?.emailAddress?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-foreground truncate">
                    {user?.fullName || user?.firstName || "My Account"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.primaryEmailAddress?.emailAddress || "No email connected"}
                  </p>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={() => openUserProfile()}
              className="w-full justify-center gap-2 rounded-xl text-xs sm:text-sm cursor-pointer"
            >
              <span>Manage Security & Login</span>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
            </Button>
          </div>

          {/* 3. Appearance Card */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sun className="w-5 h-5 text-amber-500 dark:hidden" />
                <Moon className="w-5 h-5 text-violet-400 hidden dark:inline" />
                <h3 className="text-base sm:text-lg font-bold text-foreground">
                  Appearance
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Select your preferred interface color theme.
              </p>

              {/* Theme Options */}
              <div className="grid grid-cols-3 gap-2.5">
                {/* Light */}
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer text-xs font-medium gap-1.5",
                    theme === "light"
                      ? "border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400 ring-2 ring-violet-500/20"
                      : "border-border/60 hover:bg-secondary/60 text-muted-foreground"
                  )}
                >
                  <Sun className="w-5 h-5" />
                  <span>Light</span>
                </button>

                {/* Dark */}
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer text-xs font-medium gap-1.5",
                    theme === "dark"
                      ? "border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400 ring-2 ring-violet-500/20"
                      : "border-border/60 hover:bg-secondary/60 text-muted-foreground"
                  )}
                >
                  <Moon className="w-5 h-5" />
                  <span>Dark</span>
                </button>

                {/* System */}
                <button
                  type="button"
                  onClick={() => setTheme("system")}
                  className={cn(
                    "flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer text-xs font-medium gap-1.5",
                    theme === "system"
                      ? "border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400 ring-2 ring-violet-500/20"
                      : "border-border/60 hover:bg-secondary/60 text-muted-foreground"
                  )}
                >
                  <Laptop className="w-5 h-5" />
                  <span>System</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground mt-4 text-center">
              Theme settings are saved automatically to your device.
            </p>
          </div>
        </div>

        {/* 4. Data & Privacy + Engine Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Data Management */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Download className="w-5 h-5 text-emerald-500" />
                <h3 className="text-base sm:text-lg font-bold text-foreground">
                  Data & History
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Export all your chat logs and generated prompt history as structured JSON.
              </p>

              <div className="p-3 rounded-xl bg-secondary/30 border border-border/40 mb-4 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Your conversations and outputs are privately linked to your user account and never shared with third parties.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleExportData}
              disabled={isExporting}
              className="w-full justify-center gap-2 rounded-xl text-xs sm:text-sm cursor-pointer"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-foreground" />
                  <span>Export Conversation History</span>
                </>
              )}
            </Button>
          </div>

          {/* Active AI Engines */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base sm:text-lg font-bold text-foreground">
                  Multimodal Engines
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Active models powering your creative studio.
              </p>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 text-xs">
                  <span className="font-medium text-foreground">Conversation & Code</span>
                  <span className="text-[11px] text-muted-foreground font-semibold">Gemini 1.5 Pro</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 text-xs">
                  <span className="font-medium text-foreground">Image Generation</span>
                  <span className="text-[11px] text-muted-foreground font-semibold">Imagen 3</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 text-xs">
                  <span className="font-medium text-foreground">Audio & Music</span>
                  <span className="text-[11px] text-muted-foreground font-semibold">Stable Audio</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 text-xs">
                  <span className="font-medium text-foreground">Video Synthesis</span>
                  <span className="text-[11px] text-muted-foreground font-semibold">Replicate Gen-2</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-border/40 mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>AviX Studio</span>
              <span>v2.4.0 (Latest)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
