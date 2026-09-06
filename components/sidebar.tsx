"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { Montserrat } from "next/font/google";
import {
  Plus,
  MessageSquare,
  Trash2,
  Settings,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  Zap,
  LogOut,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { UserButton, useUser, useClerk } from "@clerk/nextjs";
import axios from "axios";
import { toast } from "react-hot-toast";

import { cn } from "@/lib/utils";
import { FreeCounter } from "@/components/free-counter";
import { ModeToggle } from "@/components/mode-toggle";
import { useProModal } from "@/hooks/use-pro-modal";
import { useGenerationStore } from "@/hooks/use-generation-store";
import { MAX_FREE_COUNTS } from "@/constants";

const montserrat = Montserrat({ weight: "700", subsets: ["latin"] });

interface ConversationItem {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface SidebarProps {
  apiLimitCount?: number;
  isPro?: boolean;
  isCollapsed?: boolean;
  sidebarWidth?: number;
  onToggleCollapse?: () => void;
}

export const Sidebar = ({
  apiLimitCount = 0,
  isPro = false,
  isCollapsed = false,
  sidebarWidth = 280,
  onToggleCollapse,
}: SidebarProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeChatId = searchParams?.get("id");
  const { user } = useUser();
  const { signOut, openUserProfile } = useClerk();
  const proModal = useProModal();
  const activeTasks = useGenerationStore((state) => state.activeTasks);

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showRecentFlyout, setShowRecentFlyout] = useState(false);
  const [flyoutCoords, setFlyoutCoords] = useState<{ top: number; left: number }>({ top: 0, left: 76 });
  const [isMounted, setIsMounted] = useState(false);
  const flyoutRef = useRef<HTMLDivElement>(null);
  const recentButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const displayName =
    user?.fullName ||
    user?.firstName ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "My Account";

  // Fetch chat history
  const fetchHistory = async () => {
    try {
      const response = await axios.get("/api/chat/history");
      setConversations(response.data || []);
    } catch (error) {
      console.error("[FETCH_HISTORY_ERROR]", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();

    const handleRefresh = () => fetchHistory();
    window.addEventListener("chat-history-updated", handleRefresh);
    return () => window.removeEventListener("chat-history-updated", handleRefresh);
  }, [pathname, activeChatId]);

  // Close flyout when sidebar is expanded
  useEffect(() => {
    if (!isCollapsed) {
      setShowRecentFlyout(false);
    }
  }, [isCollapsed]);

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

  const onDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm("Delete this conversation?")) return;

    setDeletingId(chatId);
    try {
      await axios.delete(`/api/chat/${chatId}`);
      setConversations((prev) => prev.filter((c) => c.id !== chatId));
      toast.success("Chat deleted");
      if (activeChatId === chatId) {
        router.push("/chat");
      }
    } catch (error) {
      toast.error("Failed to delete chat.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleNavClick = useCallback(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768 && onToggleCollapse) {
      onToggleCollapse();
    }
  }, [onToggleCollapse]);

  const onNewChat = useCallback(() => {
    router.push("/chat");
    window.dispatchEvent(new CustomEvent("new-chat-clicked"));
    setShowRecentFlyout(false);
    if (typeof window !== "undefined" && window.innerWidth < 768 && onToggleCollapse) {
      onToggleCollapse();
    }
  }, [router, onToggleCollapse]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onNewChat();
      } else if ((e.metaKey || e.ctrlKey) && e.key === ",") {
        e.preventDefault();
        router.push("/settings");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onNewChat, router]);

  const isCompact = Boolean(isCollapsed);

  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-b from-slate-50 via-white to-zinc-50 dark:from-[#0f0c1b] dark:via-[#090810] dark:to-[#050508] text-zinc-900 dark:text-white select-none border-r border-black/[0.08] dark:border-white/[0.08] shadow-[4px_0_24px_rgba(0,0,0,0.03)] dark:shadow-[4px_0_30px_rgba(0,0,0,0.5)]">
      {/* Subtle Ambient Violet/Purple Lighting */}
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-purple-500/[0.08] dark:from-purple-600/[0.12] via-violet-500/[0.03] dark:via-violet-600/[0.04] to-transparent pointer-events-none" />
      <div className="absolute -top-12 -left-12 w-44 h-44 bg-violet-500/[0.08] dark:bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-violet-500/[0.05] dark:from-violet-600/[0.08] via-indigo-500/[0.02] dark:via-indigo-600/[0.02] to-transparent pointer-events-none" />

      {/* ========================================== */}
      {/* 1. MINIMIZED / COMPACT RAIL VIEW (68px)   */}
      {/* ========================================== */}
      {onToggleCollapse && (
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
              className="w-10 h-10 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 hover:border-purple-500/40 flex items-center justify-center text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-white transition group cursor-pointer mt-1 shadow-sm"
              title="New chat"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
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

              <div className="flex-1 overflow-y-auto space-y-1 max-h-[50vh] pr-0.5 no-scrollbar">
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
                          ? "bg-violet-500/15 dark:bg-white/15 text-zinc-900 dark:text-white font-semibold border border-violet-500/30"
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
      )}

      {/* ========================================== */}
      {/* 2. EXPANDED FULL SIDEBAR VIEW              */}
      {/* ========================================== */}
      <div
        style={{
          width: isCollapsed !== undefined ? `${sidebarWidth || 260}px` : "100%",
        }}
        className={cn(
          "absolute inset-y-0 left-0 flex flex-col h-full z-10 transition-all duration-300 ease-in-out",
          isCompact
            ? "opacity-0 pointer-events-none translate-x-2"
            : "opacity-100 pointer-events-auto translate-x-0"
        )}
      >
        {/* 1. Top Header: Brand Logo & Collapse Toggle */}
        <div className="p-3 pb-2.5 relative z-10 border-b border-black/[0.06] dark:border-white/[0.07] bg-white/70 dark:bg-[#0f0c1b]/60 backdrop-blur-xl shrink-0">
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

          {/* 2. "+ New Chat" Button */}
          <button
            onClick={onNewChat}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/[0.07] hover:bg-violet-50/80 dark:hover:bg-violet-600/20 hover:border-violet-400/50 dark:hover:border-violet-500/40 text-sm font-medium transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-violet-500/10 text-zinc-800 dark:text-white"
          >
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-violet-600 dark:text-violet-400 group-hover:rotate-90 transition-transform duration-200" />
              <span className="group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">New chat</span>
            </div>
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono group-hover:text-zinc-800 dark:group-hover:text-zinc-200 border border-black/10 dark:border-white/10 bg-zinc-100 dark:bg-white/5 px-1.5 py-0.5 rounded-md">⌘K</span>
          </button>
        </div>

        {/* 3. Chat History List (Middle Scrollable Area) */}
        <div className="flex-1 overflow-y-auto px-2.5 py-2 space-y-1 no-scrollbar relative z-10">
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
                      ? "bg-gradient-to-r from-violet-500/15 via-purple-500/10 to-violet-500/5 dark:from-violet-500/25 dark:via-purple-500/15 dark:to-white/[0.02] border border-violet-500/30 dark:border-violet-500/35 text-zinc-900 dark:text-white font-semibold shadow-sm"
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
        <div className="p-3 border-t border-black/[0.06] dark:border-white/[0.08] space-y-2.5 bg-white/80 dark:bg-[#090810] backdrop-blur-xl relative z-10 shrink-0">
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
    </div>
  );
};
