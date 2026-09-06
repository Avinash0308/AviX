"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/sidebar";

export const MobileSidebar = ({
  apiLimitCount = 0,
  isPro = false,
}: {
  apiLimitCount: number;
  isPro: boolean;
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto-close sheet when navigating between chats or pages
  useEffect(() => {
    setOpen(false);
  }, [pathname, searchParams]);

  // Listen for custom events to close mobile sidebar
  useEffect(() => {
    const handleClose = () => setOpen(false);
    window.addEventListener("new-chat-clicked", handleClose);
    window.addEventListener("close-mobile-sidebar", handleClose);
    return () => {
      window.removeEventListener("new-chat-clicked", handleClose);
      window.removeEventListener("close-mobile-sidebar", handleClose);
    };
  }, []);

  if (!isMounted) {
    return (
      <Button variant="ghost" size="icon" className="md:hidden">
        <Menu className="w-5 h-5 text-foreground" />
      </Button>
    );
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden hover:bg-black/5 dark:hover:bg-white/10 text-foreground"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        onPointerDownOutside={(e) => {
          // Prevent closing the sheet when tapping anywhere inside Clerk popovers/modals or if Clerk popover is active
          const target = e.target as HTMLElement | null;
          const hasClerkPopover = typeof document !== "undefined" && Boolean(
            document.querySelector(
              '.cl-userButtonPopover-root, .cl-userButtonPopoverCard, [class*="cl-userButtonPopover"], .cl-popover, .cl-rootBox, [data-clerk-teleport]'
            )
          );
          if (
            hasClerkPopover ||
            target?.closest?.(
              '[class*="cl-"], [data-clerk-teleport], .cl-rootBox, .cl-userButtonPopover-root, .cl-userButtonPopover-card, .cl-popover, #cl-user-button-portal'
            )
          ) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          const target = e.target as HTMLElement | null;
          const hasClerkPopover = typeof document !== "undefined" && Boolean(
            document.querySelector(
              '.cl-userButtonPopover-root, .cl-userButtonPopoverCard, [class*="cl-userButtonPopover"], .cl-popover, .cl-rootBox, [data-clerk-teleport]'
            )
          );
          if (
            hasClerkPopover ||
            target?.closest?.(
              '[class*="cl-"], [data-clerk-teleport], .cl-rootBox, .cl-userButtonPopover-root, .cl-userButtonPopover-card, .cl-popover, #cl-user-button-portal'
            )
          ) {
            e.preventDefault();
          }
        }}
        onFocusOutside={(e) => {
          // CRITICAL: Prevent Radix FocusScope from stealing focus when user touches Clerk's popover menu
          e.preventDefault();
        }}
        className="p-0 w-[290px] sm:w-[320px] max-w-[85vw] border-r border-black/[0.08] dark:border-white/[0.08] bg-slate-50 dark:bg-[#090810] text-zinc-900 dark:text-white shadow-2xl focus:outline-none [&>button.absolute]:hidden"
      >
        <Sidebar
          isPro={isPro}
          apiLimitCount={apiLimitCount}
          onToggleCollapse={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
};

