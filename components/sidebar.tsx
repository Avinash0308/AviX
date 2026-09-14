"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { toast } from "react-hot-toast";

import { useGenerationStore } from "@/hooks/use-generation-store";
import { useChatSyncStore } from "@/hooks/use-chat-sync-store";
import {
  SidebarCompactRail,
  type ConversationItem,
} from "@/components/sidebar-compact-rail";
import { SidebarExpanded } from "@/components/sidebar-expanded";
import { ConfirmDialog } from "@/components/confirm-dialog";

export type { ConversationItem };

interface SidebarProps {
  apiLimitCount?: number;
  isPro?: boolean;
  isCollapsed?: boolean;
  sidebarWidth?: number;
  onToggleCollapse?: () => void;
}

/**
 * Sidebar
 *
 * Orchestrator component that manages chat history state, keyboard shortcuts,
 * and routing, delegating rendering to SidebarCompactRail and SidebarExpanded.
 */
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
  const activeTasks = useGenerationStore((state) => state.activeTasks);

  // Subscribe to historyVersion so the sidebar auto-refetches whenever any
  // generation completes, fails, or a chat is renamed/deleted — no window event needed.
  const historyVersion = useChatSyncStore((s) => s.historyVersion);

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteChatId, setConfirmDeleteChatId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const displayName =
    user?.fullName ||
    user?.firstName ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "My Account";

  // Fetch chat history
  const fetchHistory = useCallback(async () => {
    try {
      const response = await axios.get("/api/chat/history");
      setConversations(response.data || []);
    } catch (error) {
      console.error("[FETCH_HISTORY_ERROR]", error);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory, pathname, activeChatId, historyVersion]);

  const onRequestDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmDeleteChatId(chatId);
  };

  const onConfirmDeleteChat = async () => {
    if (!confirmDeleteChatId) return;
    const chatId = confirmDeleteChatId;
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
      setConfirmDeleteChatId(null);
    }
  };

  const handleNavClick = useCallback(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768 && onToggleCollapse) {
      onToggleCollapse();
    }
  }, [onToggleCollapse]);

  const onNewChat = useCallback(() => {
    router.push("/chat");
    useChatSyncStore.getState().triggerNewChat();
    if (typeof window !== "undefined") {
      const chatInput = document.getElementById("chat-input") as HTMLTextAreaElement | null;
      chatInput?.focus({ preventScroll: true });
      if (window.innerWidth < 768 && onToggleCollapse) {
        onToggleCollapse();
      }
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
    <div className="relative w-full h-full overflow-hidden bg-background text-foreground select-none border-r border-border/40">
      {onToggleCollapse && (
        <SidebarCompactRail
          isCompact={isCompact}
          isMounted={isMounted}
          isPro={isPro}
          apiLimitCount={apiLimitCount}
          conversations={conversations}
          isLoadingHistory={isLoadingHistory}
          activeChatId={activeChatId}
          activeTasks={activeTasks}
          deletingId={deletingId}
          onDeleteChat={onRequestDeleteChat}
          onNewChat={onNewChat}
          onToggleCollapse={onToggleCollapse}
        />
      )}

      <SidebarExpanded
        isCompact={isCompact}
        sidebarWidth={sidebarWidth}
        isPro={isPro}
        apiLimitCount={apiLimitCount}
        conversations={conversations}
        isLoadingHistory={isLoadingHistory}
        activeChatId={activeChatId}
        activeTasks={activeTasks}
        deletingId={deletingId}
        displayName={displayName}
        onDeleteChat={onRequestDeleteChat}
        onNewChat={onNewChat}
        handleNavClick={handleNavClick}
        onToggleCollapse={onToggleCollapse}
      />

      <ConfirmDialog
        isOpen={!!confirmDeleteChatId}
        onClose={() => setConfirmDeleteChatId(null)}
        onConfirm={onConfirmDeleteChat}
        isLoading={!!deletingId}
      />
    </div>
  );
};
