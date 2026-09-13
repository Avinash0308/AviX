import { useState, useEffect } from "react";

/**
 * Returns true when the viewport width is below `breakpoint` (default 768px).
 * Responds reactively to window resize events.
 * Extracted from DashboardLayoutClient to isolate the concern.
 */
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < breakpoint);
    check(); // run once immediately
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);

  return isMobile;
}
