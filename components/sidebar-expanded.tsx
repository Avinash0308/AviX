"use client";

import Link from "next/link";
import Image from "next/image";
import { Montserrat } from "next/font/google";
import { usePathname, useRouter } from "next/navigation";
import { UserButton, useClerk } from "@clerk/nextjs";
import {
  PanelLeftClose,
  Edit,
  MessageSquare,
  Loader2,
  Trash2,
  Settings,
  LogOut,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { FreeCounter } from "@/components/free-counter";
import { ModeToggle } from "@/components/mode-toggle";
import type { ActiveTask } from "@/hooks/use-generation-store";
import type { ConversationItem } from "./sidebar-compact-rail";

const montserrat = Montserrat({ weight: "700", subsets: ["latin"] });

interface SidebarExpandedProps {
  isCompact: boolean;
  sidebarWidth?: number;
  isPro: boolean;
  apiLimitCount: number;
  conversations: ConversationItem[];
  isLoadingHistory: boolean;
  activeChatId: string | null;
  activeTasks: Record<string, ActiveTask>;
  deletingId: string | null;
  displayName: string;
  onDeleteChat: (e: React.MouseEvent, chatId: string) => Promise<void>;
  onNewChat: () => void;
  handleNavClick: () => void;
  onToggleCollapse?: () => void;
}

export const SidebarExpanded = ({
  isCompact,
  sidebarWidth = 280,
  isPro,
  apiLimitCount,
  conversations,
  isLoadingHistory,
  activeChatId,
  activeTasks,
  deletingId,
  displayName,
  onDeleteChat,
  onNewChat,
  handleNavClick,
  onToggleCollapse,
}: SidebarExpandedProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut, openUserProfile } = useClerk();

  return (
    <div
      style={{
        width: isCompact !== undefined ? `${sidebarWidth || 260}px` : "100%",
      }}
      className={cn(
        "absolute inset-y-0 left-0 flex flex-col h-full z-10 transition-all duration-300 ease-in-out",
        isCompact
          ? "opacity-0 pointer-events-none translate-x-2"
          : "opacity-100 pointer-events-auto translate-x-0"
      )}
    >
      {/* 1. Top Header: Brand Logo & Collapse Toggle */}
      <div className="p-3 pb-2.5 relative z-10 border-b border-border/40 bg-background shrink-0">
        <div className="flex items-center justify-between mb-3 px-0.5 py-0.5 w-full flex-nowrap gap-1">
          {/* Brand Mark matching user screenshot */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Link href="/chat" onClick={handleNavClick} className="flex items-center gap-1.5 group shrink-0">
              {/* Rounded icon container with crisp glow and no edge-clipping */}
              <div className="relative w-8 h-8 rounded-xl bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 flex items-center justify-center p-1 shadow-sm dark:shadow-md dark:shadow-purple-500/20 shrink-0 overflow-hidden group-hover:border-purple-500/60 group-hover:shadow-[0_0_14px_rgba(168,85,247,0.4)] transition-all duration-300">
                <Image src="/logo.png" alt="Genius.ai Logo" fill className="object-contain p-0.5" />
              </div>

              {/* Genius.ai title - Genius turns completely purple on hover */}
              <span
                className={cn(
                  "font-bold text-[15px] tracking-tight text-zinc-900 dark:text-white group-hover:text-[#a855f7] transition-all duration-300 shrink-0 whitespace-nowrap",
                  montserrat.className
                )}
              >
                Genius<span className="text-[#a855f7]">.ai</span>
              </span>
            </Link>

            {/* BY AVIX Pill Badge linking to GitHub profile */}
            <a
              href="https://github.com/Avinash0308"
              target="_blank"
              rel="noopener noreferrer"
              className="px-1.5 py-0.5 rounded-full border border-purple-500/30 dark:border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 dark:hover:bg-purple-500/25 hover:border-purple-400 text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-white text-[9px] font-bold tracking-wider uppercase whitespace-nowrap transition cursor-pointer shrink-0 shadow-sm shadow-purple-500/10"
              title="Visit Avinash on GitHub"
            >
              {sidebarWidth && sidebarWidth < 250 ? "AVIX" : "BY AVIX"}
            </a>
          </div>

          {/* Sidebar Collapse Button */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer shrink-0 ml-auto"
              title="Close sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 2. "New chat" Clean Minimalist Row */}
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-2.5">
            <Edit className="w-4 h-4 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
            <span>New chat</span>
          </div>
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono group-hover:text-zinc-600 dark:group-hover:text-zinc-300">
            ⌘K
          </span>
        </button>
      </div>

      {/* 3. Chat History List (Middle Scrollable Area) */}
      <div className="flex-1 overflow-y-auto px-2.5 py-2 space-y-1 no-scrollbar relative z-10 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="px-2 pt-2.5 pb-1 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
          Recent Chats
        </div>

        {isLoadingHistory ? (
          <div className="flex items-center justify-center py-8 text-zinc-500 text-xs gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-500 dark:text-violet-400" />
            Loading chats...
          </div>
        ) : conversations.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-zinc-500">
            No previous conversations.
          </div>
        ) : (
          conversations.map((chat) => {
            const isActive = activeChatId === chat.id;
            const isDeleting = deletingId === chat.id;

            return (
              <Link
                key={chat.id}
                href={`/chat?id=${chat.id}`}
                onClick={handleNavClick}
                className={cn(
                  "group flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer relative",
                  isActive
                    ? "bg-gradient-to-r from-violet-100/90 via-purple-50/90 to-violet-100/60 dark:from-violet-500/25 dark:via-purple-500/15 dark:to-white/[0.02] border border-violet-400/60 dark:border-violet-500/35 text-zinc-900 dark:text-white font-semibold shadow-xs shadow-violet-500/10"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-2">
                  {activeTasks[chat.id] ? (
                    <Loader2 className="w-3.5 h-3.5 flex-shrink-0 text-violet-500 animate-spin" />
                  ) : (
                    <MessageSquare className={cn(
                      "w-3.5 h-3.5 flex-shrink-0 transition-colors",
                      isActive ? "text-violet-600 dark:text-violet-400" : "text-zinc-400 dark:text-zinc-500 group-hover:text-violet-600 dark:group-hover:text-violet-400"
                    )} />
                  )}
                  <span className="truncate">{chat.title}</span>
                </div>

                {/* Delete Chat on Hover */}
                <button
                  onClick={(e) => onDeleteChat(e, chat.id)}
                  disabled={isDeleting}
                  className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 rounded transition cursor-pointer"
                  title="Delete chat"
                >
                  {isDeleting ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Trash2 className="w-3 h-3" />
                  )}
                </button>
              </Link>
            );
          })
        )}
      </div>

      {/* 4. Bottom Section: Upgrade to Pro, Settings & Account Profile */}
      <div className="p-3 border-t border-border/40 space-y-2.5 bg-background relative z-10 shrink-0">
        {/* Upgrade to Pro Counter - Automatically removed when isPro is true */}
        <FreeCounter apiLimitCount={apiLimitCount} isPro={isPro} />

        {/* Settings Navigation */}
        <Link
          href="/settings"
          onClick={handleNavClick}
          className={cn(
            "flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer group",
            pathname === "/settings"
              ? "bg-gradient-to-r from-violet-500/15 to-purple-500/10 dark:from-violet-500/25 dark:to-purple-500/15 border border-violet-500/30 text-zinc-900 dark:text-white font-semibold shadow-sm"
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
          )}
        >
          <div className="flex items-center gap-2.5">
            <Settings className="w-4 h-4 text-zinc-500 dark:text-zinc-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 group-hover:rotate-45 transition-all duration-300" />
            <span>Settings</span>
          </div>
          <span className="text-[10px] text-zinc-500 dark:text-zinc-500 group-hover:text-zinc-800 dark:group-hover:text-zinc-300 font-mono border border-black/10 dark:border-white/10 bg-zinc-100 dark:bg-white/5 px-1.5 py-0.5 rounded-md">⌘,</span>
        </Link>

        {/* Account Profile & Theme Toggle Row */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-100/80 dark:bg-white/[0.04] border border-black/5 dark:border-white/[0.08] hover:border-black/10 dark:hover:border-white/15 transition-colors">
          <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-1">
            <div className="shrink-0 flex items-center justify-center">
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    userButtonPopoverCard: "z-[99999]",
                    rootBox: "z-[99999]",
                  },
                }}
              />
            </div>
            <div
              onClick={() => openUserProfile?.()}
              className="flex flex-col min-w-0 cursor-pointer group/profile hover:opacity-80 transition"
              title="Manage profile & account"
            >
              <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate group-hover/profile:text-violet-500 transition-colors">
                {displayName}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                {isPro ? (
                  <span className="text-violet-600 dark:text-violet-400 font-bold bg-violet-500/10 dark:bg-violet-500/15 border border-violet-500/25 dark:border-violet-500/30 px-1.5 py-0.5 rounded-full text-[9px] tracking-wider uppercase leading-none">
                    PRO MEMBER
                  </span>
                ) : (
                  <span className="text-[10px] text-zinc-500 font-medium truncate leading-none">
                    Free Plan
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-1">
            <ModeToggle className="w-8 h-8 rounded-lg border-black/10 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-zinc-200/80 dark:hover:bg-white/10" />
            <button
              onClick={() => signOut(() => router.push("/"))}
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-red-500/10 hover:border-red-500/30 text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
