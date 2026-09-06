"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Montserrat } from "next/font/google";
import { Plus } from "lucide-react";

import { Sidebar } from "@/components/sidebar";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { cn } from "@/lib/utils";

const montserrat = Montserrat({ weight: "700", subsets: ["latin"] });

interface DashboardLayoutClientProps {
  isPro: boolean;
  apiLimitCount: number;
  children: React.ReactNode;
}

const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 240;
const MAX_WIDTH = 480;
const COLLAPSED_WIDTH = 68;

export const DashboardLayoutClient = ({
  isPro,
  apiLimitCount,
  children,
}: DashboardLayoutClientProps) => {
  const router = useRouter();
  const [sidebarWidth, setSidebarWidth] = useState<number>(DEFAULT_WIDTH);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Load preferences and detect mobile viewport on mount
  useEffect(() => {
    setIsMounted(true);

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const savedWidth = localStorage.getItem("avix_sidebar_width");
    if (savedWidth) {
      const parsed = parseInt(savedWidth, 10);
      if (!isNaN(parsed)) {
        const clamped = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, parsed));
        setSidebarWidth(clamped);
      }
    }

    const savedCollapsed = localStorage.getItem("avix_sidebar_collapsed");
    if (savedCollapsed) {
      setIsCollapsed(savedCollapsed === "true");
    }

    let scrollTimer: NodeJS.Timeout;
    const handleGlobalScroll = () => {
      document.body.classList.add("is-scrolling");
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        document.body.classList.remove("is-scrolling");
      }, 1000);
    };

    window.addEventListener("scroll", handleGlobalScroll, { passive: true, capture: true });

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("scroll", handleGlobalScroll, { capture: true });
      clearTimeout(scrollTimer);
    };
  }, []);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("avix_sidebar_collapsed", String(next));
      return next;
    });
  }, []);

  // Mouse Drag Resizing Logic (only active when expanded)
  const startResizing = useCallback(
    (e: React.MouseEvent) => {
      if (isCollapsed) return;
      e.preventDefault();
      setIsDragging(true);
    },
    [isCollapsed]
  );

  const stopResizing = useCallback(() => {
    setIsDragging(false);
  }, []);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || isCollapsed) return;
      let newWidth = e.clientX;
      if (newWidth < MIN_WIDTH) newWidth = MIN_WIDTH;
      if (newWidth > MAX_WIDTH) newWidth = MAX_WIDTH;

      setSidebarWidth(newWidth);
      localStorage.setItem("avix_sidebar_width", String(newWidth));
    },
    [isDragging, isCollapsed]
  );

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
    }
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isDragging, resize, stopResizing]);

  if (!isMounted) {
    return <div className="h-full bg-background" />;
  }

  const currentSidebarWidth = isCollapsed ? COLLAPSED_WIDTH : sidebarWidth;

  return (
    <div className="h-full relative overflow-hidden bg-background">
      {/* 1. Desktop Adjustable & Collapsible Sidebar */}
      <aside
        style={{ width: `${currentSidebarWidth}px` }}
        className={`hidden md:block fixed inset-y-0 left-0 z-50 transition-[width] duration-300 ease-in-out border-r border-black/[0.08] dark:border-white/[0.08] shadow-[4px_0_24px_rgba(0,0,0,0.03)] dark:shadow-[4px_0_30px_rgba(0,0,0,0.5)] ${
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

          {/* Drag Resize Handle (Only available when expanded) */}
          {!isCollapsed && (
            <div
              onMouseDown={startResizing}
              onDoubleClick={() => setSidebarWidth(DEFAULT_WIDTH)}
              className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-violet-500/50 active:bg-violet-500 transition-colors z-50 group"
              title="Drag to resize sidebar (Double click to reset)"
            >
              <div className="w-0.5 h-8 bg-zinc-400 dark:bg-zinc-600 group-hover:bg-violet-500 rounded-full mx-auto mt-48 transition-colors" />
            </div>
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
        {/* Mobile Header (Sleek Glassmorphic Navbar for Mobile) */}
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
                window.dispatchEvent(new CustomEvent("new-chat-clicked"));
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
