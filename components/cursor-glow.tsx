"use client";

import { useEffect, useState, useRef } from "react";

export const CursorGlow = () => {
  const [visible, setVisible] = useState(false);
  const [isHoveringClickable, setIsHoveringClickable] = useState(false);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);

  const mouseRef = useRef({
    targetX: -100,
    targetY: -100,
    spotlightX: -100,
    spotlightY: -100,
    haloX: -100,
    haloY: -100,
  });

  useEffect(() => {
    // Disable on touch devices
    if (typeof window === "undefined" || window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    let animId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
      if (!visible) setVisible(true);

      // Check if hovering an interactive element (button, link, input)
      const target = e.target as HTMLElement | null;
      if (target) {
        const isClickable = Boolean(
          target.closest("button, a, input, [role='button'], .cursor-pointer")
        );
        setIsHoveringClickable(isClickable);
      }
    };

    const handleMouseLeave = () => {
      setVisible(false);
    };

    const handleMouseEnter = () => {
      setVisible(true);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    const render = () => {
      const m = mouseRef.current;

      // Spotlight lerp (gentle ambient lag)
      m.spotlightX += (m.targetX - m.spotlightX) * 0.08;
      m.spotlightY += (m.targetY - m.spotlightY) * 0.08;

      // Halo follower lerp (smooth fluid trail)
      m.haloX += (m.targetX - m.haloX) * 0.22;
      m.haloY += (m.targetY - m.haloY) * 0.22;

      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate3d(${m.spotlightX}px, ${m.spotlightY}px, 0) translate(-50%, -50%)`;
      }

      if (haloRef.current) {
        haloRef.current.style.transform = `translate3d(${m.haloX}px, ${m.haloY}px, 0) translate(-50%, -50%)`;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [visible]);

  return (
    <div
      className={`fixed inset-0 pointer-events-none z-40 overflow-hidden transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden="true"
    >
      {/* Subtle Ambient Spotlight Glow (illuminates glass cards & borders) */}
      <div
        ref={spotlightRef}
        className="absolute top-0 left-0 w-[380px] h-[380px] rounded-full blur-3xl pointer-events-none will-change-transform opacity-50 dark:opacity-35"
        style={{
          background:
            "radial-gradient(circle, rgba(139, 92, 246, 0.16) 0%, rgba(217, 70, 239, 0.07) 40%, transparent 70%)",
        }}
      />

      {/* Micro Starlight Follower Halo */}
      <div
        ref={haloRef}
        className={`absolute top-0 left-0 rounded-full pointer-events-none will-change-transform border transition-all duration-200 ease-out flex items-center justify-center ${
          isHoveringClickable
            ? "w-9 h-9 border-violet-500/50 dark:border-white/50 bg-violet-500/10 scale-110"
            : "w-6 h-6 border-violet-500/30 dark:border-white/30 bg-violet-500/5 scale-100"
        }`}
      >
        {/* Delicate center micro-dot */}
        <div
          className={`rounded-full transition-all duration-200 ${
            isHoveringClickable
              ? "w-1.5 h-1.5 bg-primary/70 scale-125"
              : "w-1 h-1 bg-primary/40 scale-100"
          }`}
        />
      </div>
    </div>
  );
};
