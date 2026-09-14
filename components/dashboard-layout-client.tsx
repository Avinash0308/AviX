"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Montserrat } from "next/font/google";
import { Plus } from "lucide-react";

import { Sidebar } from "@/components/sidebar";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { useChatSyncStore } from "@/hooks/use-chat-sync-store";
import { useSidebarResize, DEFAULT_WIDTH } from "@/hooks/use-sidebar-resize";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { cn } from "@/lib/utils";

const montserrat = Montserrat({ weight: "700", subsets: ["latin"] });

const COLLAPSED_WIDTH = 68;
const LS_KEY_COLLAPSED = "avix_sidebar_collapsed";

interface DashboardLayoutClientProps {
  isPro: boolean;
  apiLimitCount: number;
  children: React.ReactNode;
}

export const DashboardLayoutClient = ({
  isPro,
  apiLimitCount,
  children,
}: DashboardLayoutClientProps) => {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Extracted hooks — each concern isolated to a single file
  const isMobile = useIsMobile();
  const { sidebarWidth, isDragging, startResizing, resetWidth } =
    useSidebarResize({ isCollapsed });

  // Mount: restore collapse state + attach global scroll class toggler
  useEffect(() => {
    setIsMounted(true);

    const saved = localStorage.getItem(LS_KEY_COLLAPSED);
    if (saved) setIsCollapsed(saved === "true");

    let scrollTimer: NodeJS.Timeout;
    const handleGlobalScroll = () => {
      document.body.classList.add("is-scrolling");
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(
        () => document.body.classList.remove("is-scrolling"),
        1000
      );
    };

    const handleWindowScroll = () => {
      handleGlobalScroll();
      if (window.scrollY !== 0) {
        window.scrollTo(0, 0);
      }
    };

    window.addEventListener("scroll", handleWindowScroll, {
      passive: true,
      capture: true,
    });

    return () => {
      window.removeEventListener("scroll", handleWindowScroll, {
        capture: true,
      });
      clearTimeout(scrollTimer);
    };
  }, []);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(LS_KEY_COLLAPSED, String(next));
      return next;
    });
  }, []);

  if (!isMounted) {
    return <div className="h-full bg-background" />;
  }

  const currentSidebarWidth = isCollapsed ? COLLAPSED_WIDTH : sidebarWidth;

  return (
    <div className="fixed inset-0 h-[100dvh] w-full overflow-hidden bg-background">
      {/* 1. Desktop Adjustable & Collapsible Sidebar */}
      <aside
        style={{ width: `${currentSidebarWidth}px` }}
        className={`hidden md:block fixed inset-y-0 left-0 z-50 transition-[width] duration-300 ease-in-out border-r border-border/40 bg-background ${
          isDragging ? "transition-none select-none" : ""
        }`}
      >
        <div className="h-full relative w-full">
          <Sidebar
            isPro={isPro}
            apiLimitCount={apiLimitCount}
            isCollapsed={isCollapsed}
            sidebarWidth={sidebarWidth}
            onToggleCollapse={toggleCollapse}
          />

          {/* Drag Resize Handle (only when expanded) */}
          {!isCollapsed && (
            <div
              onMouseDown={startResizing}
              onDoubleClick={resetWidth}
              className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-violet-500/20 active:bg-violet-500/40 transition-colors z-50"
              title="Drag to resize sidebar (Double click to reset)"
            />
          )}
        </div>
      </aside>

      {/* 2. Main Content Viewport */}
      <main
        style={{
          paddingLeft: isMobile ? "0px" : `${currentSidebarWidth}px`,
        }}
        className={`flex flex-col h-full transition-[padding-left] duration-300 ease-in-out ${
          isDragging ? "transition-none select-none" : ""
        }`}
      >
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-3 py-2 border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-40 shrink-0">
          <div className="flex items-center gap-2">
            <MobileSidebar isPro={isPro} apiLimitCount={apiLimitCount} />
            <div className="flex items-center gap-2">
              <div className="relative w-7 h-7 rounded-lg bg-white dark:bg-zinc-900 border border-black/10 dark:border-white/10 flex items-center justify-center p-0.5 shadow-sm">
                <Image src="/logo.png" alt="Genius.ai Logo" fill className="object-contain p-0.5" />
              </div>
              <span className={cn("font-bold text-sm tracking-tight text-foreground", montserrat.className)}>
                Genius<span className="text-violet-500">.ai</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                router.push("/chat");
                useChatSyncStore.getState().triggerNewChat();
                if (typeof window !== "undefined") {
                  const chatInput = document.getElementById("chat-input") as HTMLTextAreaElement | null;
                  chatInput?.focus({ preventScroll: true });
                }
              }}
              className="p-1.5 rounded-lg border border-border/60 bg-secondary/50 hover:bg-secondary text-foreground transition-all cursor-pointer"
              title="New chat"
            >
              <Plus className="w-4 h-4 text-violet-400" />
            </button>
            <ModeToggle className="w-8 h-8 rounded-lg" />
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-hidden">{children}</div>
      </main>
    </div>
  );
};
