"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import {
  Copy,
  Check,
  Download,
  Play,
  Pause,
  Sparkles,
  Bot,
  User,
  Volume2,
  Film,
  Code as CodeIcon,
  ImageIcon,
} from "lucide-react";
import { BotAvatar } from "@/components/bot-avatar";
import { UserAvatar } from "@/components/user-avatar";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: "text" | "code" | "image" | "audio" | "video";
  mediaUrl?: string | string[];
  modelUsed?: string;
  duration?: number;
  createdAt?: string | Date;
}

interface OmnimodalMessageProps {
  message: ChatMessage;
}

export const OmnimodalMessage = ({ message }: OmnimodalMessageProps) => {
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isUser = message.role === "user";

  const onCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div
      className={`flex gap-3 md:gap-4 p-4 md:p-6 rounded-2xl transition-all ${
        isUser
          ? "bg-secondary/40 ml-6 md:ml-16 self-end"
          : "bg-background border border-border/60 shadow-sm mr-6 md:mr-16"
      }`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 mt-0.5">
        {isUser ? <UserAvatar /> : <BotAvatar />}
      </div>

      {/* Message Content Container */}
      <div className="flex-1 min-w-0 space-y-3">
        {/* Header with Sender & Copy Button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground/80">
              {isUser ? "You" : "Genius.ai"}
            </span>
          </div>

          {!isUser && message.content && (
            <button
              onClick={() => onCopy(message.content)}
              className="text-muted-foreground hover:text-foreground transition p-1 rounded-md hover:bg-secondary/60"
              title="Copy text"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* 1. TEXT / CONVERSATION */}
        {message.type !== "image" && message.type !== "audio" && message.type !== "video" && (
          <div className="prose prose-sm dark:prose-invert max-w-none break-words text-sm leading-relaxed text-foreground/90">
            <ReactMarkdown
              components={{
                pre: ({ node, ...props }) => (
                  <div className="relative overflow-auto w-full my-3 bg-zinc-950 text-zinc-100 p-4 rounded-xl border border-zinc-800 font-mono text-xs">
                    <pre {...props} />
                  </div>
                ),
                code: ({ node, inline, ...props }) =>
                  inline ? (
                    <code className="bg-secondary px-1.5 py-0.5 rounded-md font-mono text-xs" {...props} />
                  ) : (
                    <code {...props} />
                  ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {/* 2. IMAGE RENDERING */}
        {message.type === "image" && message.mediaUrl && (
          <div className="space-y-2">
            {message.content && (
              <p className="text-xs text-muted-foreground italic mb-2">&ldquo;{message.content}&rdquo;</p>
            )}
            <div className="relative group rounded-xl overflow-hidden border border-border/80 bg-zinc-950 aspect-square max-w-md shadow-md">
              <Image
                src={Array.isArray(message.mediaUrl) ? message.mediaUrl[0] : message.mediaUrl}
                alt="Generated photo"
                fill
                className="object-cover transition duration-300 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                <a
                  href={Array.isArray(message.mediaUrl) ? message.mediaUrl[0] : message.mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-md text-white text-xs font-medium hover:bg-white/30 transition shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download 8K Photo
                </a>
              </div>
            </div>
          </div>
        )}

        {/* 3. AUDIO / MUSIC RENDERING */}
        {message.type === "audio" && message.mediaUrl && (
          <div className="space-y-3 max-w-md">
            {message.content && (
              <p className="text-xs text-muted-foreground italic">&ldquo;{message.content}&rdquo;</p>
            )}
            <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-foreground">Studio Music Track</span>
                    <span className="block text-[10px] text-muted-foreground">
                      {message.duration ? `${message.duration} seconds` : "Audio generated"}
                    </span>
                  </div>
                </div>

                <a
                  href={typeof message.mediaUrl === "string" ? message.mediaUrl : message.mediaUrl[0]}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-400 transition"
                  title="Download track"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>

              {/* Native Audio Element & Custom Player */}
              <audio
                ref={audioRef}
                src={typeof message.mediaUrl === "string" ? message.mediaUrl : message.mediaUrl[0]}
                onEnded={() => setIsPlaying(false)}
                className="w-full h-10 mt-1"
                controls
              />
            </div>
          </div>
        )}

        {/* 4. VIDEO RENDERING */}
        {message.type === "video" && message.mediaUrl && (
          <div className="space-y-3 max-w-lg">
            {message.content && (
              <p className="text-xs text-muted-foreground italic">&ldquo;{message.content}&rdquo;</p>
            )}
            <div className="rounded-xl overflow-hidden border border-border/80 bg-zinc-950 shadow-md">
              <video
                src={typeof message.mediaUrl === "string" ? message.mediaUrl : message.mediaUrl[0]}
                controls
                playsInline
                className="w-full aspect-video object-cover"
              />
              <div className="p-2.5 bg-secondary/30 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Film className="w-3.5 h-3.5 text-orange-400" />
                  720p HD Cinematic (24fps)
                </span>
                <a
                  href={typeof message.mediaUrl === "string" ? message.mediaUrl : message.mediaUrl[0]}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-foreground/80 hover:text-foreground font-medium transition"
                >
                  <Download className="w-3 h-3" />
                  Download MP4
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
