"use client";

import Image from "next/image";

interface OmnimodalEmptyProps {
  userName?: string;
  children?: React.ReactNode;
}

export const OmnimodalEmpty = ({ userName, children }: OmnimodalEmptyProps) => {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center max-sm:px-0 sm:px-4 py-2 sm:py-8 my-auto animate-in fade-in duration-500 overflow-visible">
      {/* ========================================================================= */}
      {/* Bilateral Ambient Aurora: Dense at text box ends, soft & gentle in middle */}
      {/* ========================================================================= */}

      {/* --- DARK MODE --- */}
      <div className="absolute inset-0 pointer-events-none z-0 hidden dark:block overflow-visible">
        {/* 1. Broad Ambient Base (Smooth continuous illumination centered on input & greeting) */}
        <div className="absolute top-[60%] sm:top-[62%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] sm:w-[1000px] h-[280px] sm:h-[340px] rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.13)_0%,_rgba(109,40,217,0.07)_45%,_transparent_75%)] blur-[60px]" />

        {/* 2. Middle Glow (Visible violet aura directly behind headline & pill box center) */}
        <div className="absolute top-[58%] sm:top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] sm:w-[620px] h-[190px] sm:h-[230px] rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(147,51,234,0.18)_0%,_rgba(124,58,237,0.10)_50%,_transparent_75%)] blur-[50px]" />

        {/* 3. Left Wing Glow (Denser violet saturation at left end of text box) */}
        <div className="absolute top-[60%] sm:top-[62%] left-[calc(50%-180px)] sm:left-[calc(50%-240px)] -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[420px] h-[190px] sm:h-[240px] rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(168,85,247,0.24)_0%,_rgba(139,92,246,0.12)_50%,_transparent_75%)] blur-[45px]" />

        {/* 4. Right Wing Glow (Denser violet saturation at right end of text box) */}
        <div className="absolute top-[60%] sm:top-[62%] left-[calc(50%+180px)] sm:left-[calc(50%+240px)] -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[420px] h-[190px] sm:h-[240px] rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(168,85,247,0.24)_0%,_rgba(139,92,246,0.12)_50%,_transparent_75%)] blur-[45px]" />
      </div>

      {/* --- LIGHT MODE --- */}
      <div className="absolute inset-0 pointer-events-none z-0 dark:hidden overflow-visible">
        {/* 1. Broad Ambient Base */}
        <div className="absolute top-[60%] sm:top-[62%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] sm:w-[1000px] h-[280px] sm:h-[340px] rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(196,181,253,0.55)_0%,_rgba(221,214,254,0.30)_45%,_transparent_75%)] blur-[60px]" />

        {/* 2. Middle Glow */}
        <div className="absolute top-[58%] sm:top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] sm:w-[620px] h-[190px] sm:h-[230px] rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(167,139,250,0.50)_0%,_rgba(196,181,253,0.25)_50%,_transparent_75%)] blur-[50px]" />

        {/* 3. Left Wing Glow */}
        <div className="absolute top-[60%] sm:top-[62%] left-[calc(50%-180px)] sm:left-[calc(50%-240px)] -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[420px] h-[190px] sm:h-[240px] rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(147,51,234,0.48)_0%,_rgba(167,139,250,0.28)_50%,_transparent_75%)] blur-[45px]" />

        {/* 4. Right Wing Glow */}
        <div className="absolute top-[60%] sm:top-[62%] left-[calc(50%+180px)] sm:left-[calc(50%+240px)] -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[420px] h-[190px] sm:h-[240px] rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(147,51,234,0.48)_0%,_rgba(167,139,250,0.28)_50%,_transparent_75%)] blur-[45px]" />
      </div>

      {/* Brand Logo Badge with Radiant Colored Glow for Light & Dark Mode */}
      <div className="relative mb-3 sm:mb-8 z-10 sm:-translate-y-2 shrink-0">
        {/* Outer Radiant Glow Aura (Pure colored gradient emission, zero dark/black shadow) */}
        <div className="absolute -inset-2 sm:-inset-2.5 rounded-3xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-pink-500 opacity-60 dark:opacity-75 blur-xl -z-10 animate-pulse" />
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-pink-500 opacity-40 dark:opacity-50 blur-md -z-10" />

        {/* Vibrant Gradient Badge with Luminous Color Ring */}
        <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-pink-500 flex items-center justify-center p-2.5 sm:p-3.5 shadow-[0_0_20px_rgba(168,85,247,0.35)] dark:shadow-[0_0_25px_rgba(168,85,247,0.5)]">
          <div className="relative w-full h-full">
            <Image
              src="/logo.png"
              alt="AviX Logo"
              fill
              className="object-contain filter brightness-0 invert drop-shadow-[0_0_8px_rgba(255,255,255,0.75)]"
              priority
            />
          </div>
        </div>
      </div>

      {/* Refined Sizing Greeting Headline */}
      <h1 className="relative z-10 text-base sm:text-2xl md:text-3xl font-medium tracking-tight text-foreground text-center mb-4 sm:mb-8 max-sm:px-4 px-2 leading-snug select-none">
        {userName ? `Hi ${userName}, how can I help you today?` : "Hi there, how can I help you today?"}
      </h1>

      {/* Centered Input Form Container */}
      {children && (
        <div className="relative z-10 w-full max-w-2xl sm:max-w-3xl max-sm:px-4">
          {children}
        </div>
      )}
    </div>
  );
};
