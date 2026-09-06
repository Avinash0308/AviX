"use client";

import { Zap, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { MAX_FREE_COUNTS } from "@/constants";
import { useProModal } from "@/hooks/use-pro-modal";

interface FreeCounterProps {
  isPro?: boolean;
  apiLimitCount?: number;
}

export const FreeCounter = ({
  isPro = false,
  apiLimitCount = 0,
}: FreeCounterProps) => {
  const [mounted, setMounted] = useState(false);
  const proModal = useProModal();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isPro) {
    return null;
  }

  const percentage = Math.min(100, Math.round((apiLimitCount / MAX_FREE_COUNTS) * 100));

  return (
    <div className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/[0.04] p-3 space-y-2.5 transition-all shadow-sm">
      {/* Usage Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400 fill-violet-400/20" />
          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Free Generations</span>
        </div>
        <span className="text-xs font-semibold font-mono text-zinc-900 dark:text-zinc-200">
          {apiLimitCount} <span className="text-zinc-400 dark:text-zinc-500 font-normal">/ {MAX_FREE_COUNTS}</span>
        </span>
      </div>

      {/* Slim Modern Progress Bar */}
      <div className="w-full bg-zinc-200 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Upgrade CTA Button */}
      <button
        onClick={proModal.onOpen}
        className="w-full h-8 rounded-lg bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 hover:from-violet-500 hover:via-purple-500 hover:to-pink-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm shadow-purple-500/20 hover:shadow-purple-500/30 transition-all active:scale-[0.99] cursor-pointer group"
      >
        <Sparkles className="w-3.5 h-3.5 text-white/90 group-hover:rotate-12 transition-transform duration-200" />
        <span>Upgrade to Pro</span>
      </button>
    </div>
  );
};