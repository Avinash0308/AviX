"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import {
  Copy,
  Check,
  Download,
  Volume2,
  Film,
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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isUser = message.role === "user";

  const onCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isUser) {
    return (
      <div className="w-full flex justify-end pr-1 sm:pr-1.5">
        <div className="flex items-start gap-2.5 md:gap-3 max-w-[85%] sm:max-w-[75%] flex-row-reverse">
          {/* User Avatar */}
          <div className="flex-shrink-0 mt-0.5">
            <UserAvatar />
          </div>

          {/* User Content Bubble */}
          <div className="w-fit max-w-full rounded-2xl rounded-tr-xs bg-violet-600/10 dark:bg-violet-500/20 border border-violet-500/25 dark:border-violet-500/35 px-4 py-2.5 md:px-5 md:py-3 shadow-xs">
            <div className="prose prose-sm dark:prose-invert max-w-none break-words text-sm leading-relaxed text-foreground">
              <ReactMarkdown
                components={{
                  pre: ({ node, ...props }) => (
                    <div className="relative overflow-auto w-full my-2 bg-zinc-950 text-zinc-100 p-3 rounded-xl border border-zinc-800 font-mono text-xs">
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
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-start">
      <div className="flex items-start gap-2.5 md:gap-3 max-w-[92%] sm:max-w-[85%]">
        {/* Bot Avatar */}
        <div className="flex-shrink-0 mt-0.5">
          <BotAvatar />
        </div>

        {/* Bot Content Bubble */}
        <div className="w-fit max-w-full rounded-2xl rounded-tl-xs bg-card dark:bg-zinc-900/90 border border-border/80 p-4 md:p-5 shadow-sm space-y-3">
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
                <div className="relative group rounded-xl overflow-hidden border border-border/80 bg-zinc-950 aspect-square w-72 sm:w-80 md:w-96 max-w-full shadow-md">
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
              <div className="space-y-3 w-72 sm:w-80 md:w-96 max-w-full">
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

                  <audio
                    ref={audioRef}
                    src={typeof message.mediaUrl === "string" ? message.mediaUrl : message.mediaUrl[0]}
                    className="w-full h-10 mt-1"
                    controls
                  />
                </div>
              </div>
            )}

            {/* 4. VIDEO RENDERING */}
            {message.type === "video" && message.mediaUrl && (
              <div className="space-y-3 w-80 sm:w-96 md:w-[480px] max-w-full">
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

            {/* Bottom Copy Action for Assistant */}
            {message.content && (
              <div className="pt-2 border-t border-border/40 flex justify-end">
                <button
                  onClick={() => onCopy(message.content)}
                  className="text-muted-foreground hover:text-foreground transition px-2 py-1 rounded-md hover:bg-secondary/60 flex items-center gap-1.5 text-xs"
                  title="Copy text"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-500 font-medium text-xs">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-xs">Copy</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

