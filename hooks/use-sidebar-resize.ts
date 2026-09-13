import { useState, useEffect, useCallback } from "react";

const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 240;
const MAX_WIDTH = 480;
const LS_KEY_WIDTH = "avix_sidebar_width";

interface UseSidebarResizeOptions {
  isCollapsed: boolean;
}

interface UseSidebarResizeReturn {
  sidebarWidth: number;
  isDragging: boolean;
  startResizing: (e: React.MouseEvent) => void;
  resetWidth: () => void;
}

/**
 * Manages sidebar drag-to-resize state with localStorage persistence.
 * Extracted from DashboardLayoutClient to keep that component focused on layout.
 */
export function useSidebarResize({
  isCollapsed,
}: UseSidebarResizeOptions): UseSidebarResizeReturn {
  const [sidebarWidth, setSidebarWidth] = useState<number>(DEFAULT_WIDTH);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Restore persisted width on mount
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY_WIDTH);
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed)) {
        setSidebarWidth(Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, parsed)));
      }
    }
  }, []);

  const startResizing = useCallback(
    (e: React.MouseEvent) => {
      if (isCollapsed) return;
      e.preventDefault();
      setIsDragging(true);
    },
    [isCollapsed]
  );

  const stopResizing = useCallback(() => setIsDragging(false), []);

  const resize = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || isCollapsed) return;
      const newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, e.clientX));
      setSidebarWidth(newWidth);
      localStorage.setItem(LS_KEY_WIDTH, String(newWidth));
    },
    [isDragging, isCollapsed]
  );

  // Wire up / tear down global mouse listeners only while dragging
  useEffect(() => {
    if (!isDragging) return;
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isDragging, resize, stopResizing]);

  const resetWidth = useCallback(() => {
    setSidebarWidth(DEFAULT_WIDTH);
    localStorage.setItem(LS_KEY_WIDTH, String(DEFAULT_WIDTH));
  }, []);

  return { sidebarWidth, isDragging, startResizing, resetWidth };
}

export { DEFAULT_WIDTH };
