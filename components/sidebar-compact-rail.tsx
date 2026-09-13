"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { UserButton, useClerk } from "@clerk/nextjs";
import {
  Edit,
  MessageSquare,
  Trash2,
  Settings,
  Loader2,
  PanelLeftOpen,
  Zap,
  LogOut,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import { useProModal } from "@/hooks/use-pro-modal";
import type { ActiveTask } from "@/hooks/use-generation-store";
import { MAX_FREE_COUNTS } from "@/constants";

export interface ConversationItem {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface SidebarCompactRailProps {
  isCompact: boolean;
  isMounted: boolean;
  isPro: boolean;
  apiLimitCount: number;
  conversations: ConversationItem[];
  isLoadingHistory: boolean;
  activeChatId: string | null;
  activeTasks: Record<string, ActiveTask>;
  deletingId: string | null;
  onDeleteChat: (e: React.MouseEvent, chatId: string) => Promise<void>;
  onNewChat: () => void;
  onToggleCollapse?: () => void;
}

export const SidebarCompactRail = ({
  isCompact,
  isMounted,
  isPro,
  apiLimitCount,
  conversations,
  isLoadingHistory,
  activeChatId,
  activeTasks,
  deletingId,
  onDeleteChat,
  onNewChat,
  onToggleCollapse,
}: SidebarCompactRailProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useClerk();
  const proModal = useProModal();

  const [showRecentFlyout, setShowRecentFlyout] = useState(false);
  const [flyoutCoords, setFlyoutCoords] = useState<{ top: number; left: number }>({ top: 0, left: 76 });
  const flyoutRef = useRef<HTMLDivElement>(null);
  const recentButtonRef = useRef<HTMLButtonElement>(null);

  // Close flyout when sidebar expands
  useEffect(() => {
    if (!isCompact) {
      setShowRecentFlyout(false);
    }
  }, [isCompact]);

  // Close flyout when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        flyoutRef.current &&
        !flyoutRef.current.contains(target) &&
        recentButtonRef.current &&
        !recentButtonRef.current.contains(target)
      ) {
        setShowRecentFlyout(false);
      }
    };
    if (showRecentFlyout) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showRecentFlyout]);

  const toggleRecentFlyout = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!showRecentFlyout && recentButtonRef.current) {
      const rect = recentButtonRef.current.getBoundingClientRect();
      const flyoutEstimatedHeight = 360;
      const topPos = Math.max(16, Math.min(rect.top - 20, window.innerHeight - flyoutEstimatedHeight - 20));
      setFlyoutCoords({
        top: topPos,
        left: rect.right + 12,
      });
    }
    setShowRecentFlyout((prev) => !prev);
  };

  return (
    <>
      <div
        className={cn(
          "absolute inset-y-0 left-0 w-[68px] flex flex-col h-full items-center justify-between py-3.5 px-2 z-20 transition-all duration-300 ease-in-out",
          isCompact
            ? "opacity-100 pointer-events-auto translate-x-0"
            : "opacity-0 pointer-events-none -translate-x-3"
        )}
      >
        {/* Top: Logo (with Hover-to-Maximize) & Actions */}
        <div className="flex flex-col items-center w-full gap-2 relative z-10">
          {/* Logo with hover-to-maximize option */}
          <button
            onClick={onToggleCollapse}
            className="relative w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 hover:border-purple-500/50 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center justify-center p-1 shadow-sm dark:shadow-md dark:shadow-purple-500/10 cursor-pointer group transition-all"
            title="Expand sidebar"
          >
            <div className="relative w-7 h-7 transition-opacity duration-200 group-hover:opacity-0 flex items-center justify-center">
              <Image src="/logo.png" alt="Genius.ai Logo" fill className="object-contain" />
            </div>
            <PanelLeftOpen className="w-5 h-5 text-purple-600 dark:text-purple-400 absolute opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </button>

          {/* New Chat Button */}
          <button
            onClick={onNewChat}
            className="w-10 h-10 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition group cursor-pointer mt-1"
            title="New chat"
          >
            <Edit className="w-4 h-4" />
          </button>

          {/* Recent Chats Button */}
          <div className="relative">
            <button
              ref={recentButtonRef}
              onClick={toggleRecentFlyout}
              className={cn(
                "w-10 h-10 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition cursor-pointer",
                showRecentFlyout && "bg-black/5 dark:bg-white/10 text-purple-600 dark:text-purple-400"
              )}
              title="Recent chats"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bottom Section: Upgrade to Pro, Settings, Theme Mode & Account Profile */}
        <div className="flex flex-col items-center w-full gap-2.5 pt-3 border-t border-black/[0.08] dark:border-white/10">
          {/* Upgrade to Pro (Compact Button) - Removed when user has Pro */}
          {!isPro && (
            <div className="w-full flex justify-center pb-2.5 mb-1 border-b border-black/[0.06] dark:border-white/[0.08]">
              <button
                onClick={proModal.onOpen}
                className="w-9 h-9 rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-500 hover:via-purple-500 hover:to-pink-500 text-white flex items-center justify-center shadow-md shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
                title={`Upgrade to Pro (${apiLimitCount}/${MAX_FREE_COUNTS} free generations)`}
              >
                <Zap className="w-4 h-4 fill-white text-white group-hover:rotate-12 transition-transform duration-200" />
              </button>
            </div>
          )}

          {/* Settings Link */}
          <Link
            href="/settings"
            className={cn(
              "w-9 h-9 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition cursor-pointer",
              pathname === "/settings" ? "bg-black/5 dark:bg-white/15 text-zinc-900 dark:text-white" : "bg-transparent"
            )}
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </Link>

          {/* Theme Mode Toggle */}
          <div title="Theme mode">
            <ModeToggle className="w-9 h-9 rounded-xl border-black/10 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 transition-all" />
          </div>

          {/* Account Profile */}
          <div className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition" title="My Account">
            <UserButton afterSignOutUrl="/" />
          </div>

          {/* Quick Sign Out (Collapsed) */}
          <button
            onClick={() => signOut(() => router.push("/"))}
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-red-500/10 hover:border-red-500/30 text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-all cursor-pointer"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Portal Flyout for Minimized Sidebar Recent Chats */}
      {isMounted && isCompact && showRecentFlyout && typeof document !== "undefined" && createPortal(
        <div
          ref={flyoutRef}
          style={{
            position: "fixed",
            top: `${flyoutCoords.top}px`,
            left: `${flyoutCoords.left}px`,
          }}
          className="w-72 max-w-[calc(100vw-88px)] p-3 rounded-2xl bg-white/95 dark:bg-[#0f0c1b]/95 backdrop-blur-2xl border border-black/10 dark:border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.7)] z-[9999] max-h-[70vh] flex flex-col space-y-2 animate-in fade-in zoom-in-95 duration-150 text-zinc-900 dark:text-white"
        >
          <div className="flex items-center justify-between pb-2 border-b border-black/10 dark:border-white/10 text-xs font-bold text-zinc-600 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Recent Chats</span>
            </div>
            {onToggleCollapse && (
              <button
                type="button"
                className="text-[11px] font-medium text-purple-600 dark:text-purple-400 cursor-pointer hover:underline"
                onClick={() => {
                  setShowRecentFlyout(false);
                  onToggleCollapse();
                }}
              >
                Expand sidebar
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 max-h-[50vh] pr-0.5 no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-6 text-zinc-500 text-xs gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-500 dark:text-violet-400" />
                Loading chats...
              </div>
            ) : conversations.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-500">No previous chats yet</div>
            ) : (
              conversations.map((chat) => (
                <Link
                  key={chat.id}
                  href={`/chat?id=${chat.id}`}
                  onClick={() => setShowRecentFlyout(false)}
                  className={cn(
                    "flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition group",
                    activeChatId === chat.id
                      ? "bg-gradient-to-r from-violet-100/90 via-purple-50/90 to-violet-100/60 dark:from-violet-500/25 dark:via-purple-500/15 dark:to-white/[0.02] border border-violet-400/60 dark:border-violet-500/35 text-zinc-900 dark:text-white font-semibold shadow-xs"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    {activeTasks[chat.id] && (
                      <Loader2 className="w-3 h-3 flex-shrink-0 text-violet-500 animate-spin" />
                    )}
                    <span className="truncate">{chat.title}</span>
                  </div>
                  <button
                    onClick={(e) => onDeleteChat(e, chat.id)}
                    disabled={deletingId === chat.id}
                    className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 p-0.5 transition shrink-0"
                    title="Delete chat"
                  >
                    {deletingId === chat.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                  </button>
                </Link>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
