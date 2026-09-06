"use client";

import Image from "next/image";
import { MessageSquare, Code, ImageIcon, Music, VideoIcon } from "lucide-react";

interface OmnimodalEmptyProps {
  onSelectPrompt: (prompt: string) => void;
}

const SUGGESTIONS = [
  {
    icon: MessageSquare,
    label: "Ask a Question",
    prompt: "Explain how neural networks learn in simple intuitive terms",
    color: "text-violet-500",
    bg: "bg-violet-500/10 hover:bg-violet-500/20 border-violet-500/20",
  },
  {
    icon: Code,
    label: "Generate Code",
    prompt: "Write a reusable debounce hook in React with TypeScript",
    color: "text-green-500",
    bg: "bg-green-500/10 hover:bg-green-500/20 border-green-500/20",
  },
  {
    icon: ImageIcon,
    label: "Create Photo",
    prompt: "RAW 35mm photo of an artisan crafting a mechanical watch in Tokyo",
    color: "text-pink-500",
    bg: "bg-pink-500/10 hover:bg-pink-500/20 border-pink-500/20",
  },
  {
    icon: Music,
    label: "Compose Music",
    prompt: "Compose a 15-second acoustic jazz piano melody with soft drums",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20",
  },
  {
    icon: VideoIcon,
    label: "Render Video",
    prompt: "Cinematic video of ocean waves crashing against black volcanic rocks",
    color: "text-orange-500",
    bg: "bg-orange-500/10 hover:bg-orange-500/20 border-orange-500/20",
  },
];

export const OmnimodalEmpty = ({ onSelectPrompt }: OmnimodalEmptyProps) => {
  return (
    <div className="w-full flex flex-col items-center justify-center p-4 md:p-8 max-w-4xl mx-auto text-center my-auto">
      {/* Animated Glowing Brand Logo Badge */}
      <div className="relative mb-6">
        {/* Intense Multi-Layer Ambient Glow Aura */}
        <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-pink-500 opacity-70 blur-2xl -z-10 animate-pulse" />
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-pink-500 opacity-40 blur-lg -z-10" />

        {/* Vibrant Gradient Badge with Intense Shadow */}
        <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-pink-500 flex items-center justify-center p-3.5 shadow-lg shadow-violet-500/40 animate-pulse">
          <div className="relative w-full h-full">
            <Image
              src="/logo.png"
              alt="Genius.ai Logo"
              fill
              className="object-contain filter brightness-0 invert drop-shadow-[0_2px_6px_rgba(0,0,0,0.25)]"
              priority
            />
          </div>
        </div>
      </div>

      <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
        What would you like to create?
      </h2>
      <p className="text-muted-foreground text-sm md:text-base max-w-lg mb-8">
        Converse freely, write production code, render real-life photos, compose music, or create cinematic videos—all in this single conversation.
      </p>

      {/* Suggestion Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full text-left">
        {SUGGESTIONS.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={() => onSelectPrompt(item.prompt)}
              className={`p-4 rounded-xl border transition-all duration-200 group text-left cursor-pointer hover:shadow-md hover:-translate-y-0.5 ${item.bg}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${item.color}`} />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-foreground">
                  {item.label}
                </span>
              </div>
              <p className="text-xs md:text-sm font-medium text-foreground/90 line-clamp-2">
                &ldquo;{item.prompt}&rdquo;
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
