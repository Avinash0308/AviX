"use client";

/**
 * omnimodal-message.tsx
 *
 * This file is now a thin composition layer (~380 lines vs the original ~1,150).
 * Each sub-component lives in its own focused file under components/message/:
 *
 *   code-block.tsx       — syntax-highlighted code renderer
 *   table-block.tsx      — scrollable table with TSV copy
 *   task-checkbox.tsx    — interactive GFM task checkboxes
 *   mermaid-block.tsx    — Mermaid diagram renderer (SVG cache, render queue)
 *   audio-player-card.tsx— audio player UI
 */

import { useState, useEffect } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import {
  Copy,
  Check,
  Download,
  Volume2,
  Square,
  Film,
  Pencil,
  ExternalLink,
} from "lucide-react";

import { BotAvatar } from "@/components/bot-avatar";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types";
import { CodeBlock } from "@/components/message/code-block";
import { TableBlock } from "@/components/message/table-block";
import { TaskCheckbox } from "@/components/message/task-checkbox";
import { MermaidBlock } from "@/components/message/mermaid-block";
import { AudioPlayerCard } from "@/components/message/audio-player-card";

// Re-exported for backward compatibility — prefer importing directly from @/lib/types
export type { ChatMessage };

interface OmnimodalMessageProps {
  message: ChatMessage;
  onEditPrompt?: (prompt: string) => void;
}

/**
 * Normalizes Markdown content so tables render properly without mutating valid tables.
 */
function formatMarkdownContent(raw: string): string {
  if (!raw) return "";
  if (!raw.includes("\n|") && raw.includes("| |")) {
    return raw.replace(/\|\s*\|\s*/g, "|\n|");
  }
  return raw;
}

export const OmnimodalMessage = ({ message, onEditPrompt }: OmnimodalMessageProps) => {
  const [copied, setCopied] = useState(false);
  const [copiedMedia, setCopiedMedia] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const onToggleReadAloud = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    const cleanSpeechText = message.content
      .replace(/```[\s\S]*?```/g, "Code block omitted.")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[#*_~>|]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleanSpeechText) return;

    const utterance = new SpeechSynthesisUtterance(cleanSpeechText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const isUser = message.role === "user";

  const onCopy = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rawMediaUrl = Array.isArray(message.mediaUrl)
    ? message.mediaUrl[0]
    : typeof message.mediaUrl === "string"
    ? message.mediaUrl
    : "";

  const onCopyMedia = async (url: string, type: "image" | "audio" | "video") => {
    if (!url) return;
    try {
      if (type === "image") {
        try {
          const res = await fetch(url, { mode: "cors" });
          const blob = await res.blob();
          if (blob.type === "image/png") {
            await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
            setCopiedMedia(type);
            setTimeout(() => setCopiedMedia(null), 2000);
            return;
          }

          const img = new window.Image();
          img.crossOrigin = "anonymous";
          img.src = url;
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });

          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            canvas.toBlob(async (pngBlob) => {
              if (pngBlob) {
                try {
                  await navigator.clipboard.write([new ClipboardItem({ "image/png": pngBlob })]);
                } catch {
                  await navigator.clipboard.writeText(url);
                }
              } else {
                await navigator.clipboard.writeText(url);
              }
            }, "image/png");
            setCopiedMedia(type);
            setTimeout(() => setCopiedMedia(null), 2000);
            return;
          }
        } catch {
          // Fallback to URL copy
        }
      }

      await navigator.clipboard.writeText(url);
      setCopiedMedia(type);
      setTimeout(() => setCopiedMedia(null), 2000);
    } catch (err) {
      console.error("Failed to copy media:", err);
    }
  };

  const onCopyAll = () => {
    const parts: string[] = [];
    if (message.content?.trim()) parts.push(message.content.trim());
    if (message.mediaUrl) {
      if (Array.isArray(message.mediaUrl)) {
        parts.push(message.mediaUrl.join("\n"));
      } else if (typeof message.mediaUrl === "string" && message.mediaUrl.trim()) {
        parts.push(message.mediaUrl.trim());
      }
    }
    const fullText = parts.join("\n\n");
    if (fullText) {
      navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ── Shared ReactMarkdown component overrides ────────────────────────────────

  const sharedCodeOverride = ({ node, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || "");
    const code = String(children).replace(/\n$/, "");
    if (!match && !code.includes("\n")) {
      return (
        <code className="bg-secondary px-1.5 py-0.5 rounded-md font-mono text-xs" {...props}>
          {children}
        </code>
      );
    }
    const language = match ? match[1] : "";
    if (language.toLowerCase() === "mermaid") return <MermaidBlock chart={code} />;
    return <CodeBlock language={language} code={code} />;
  };

  const sharedLiOverride = ({ node, children, className, ...props }: any) => {
    if (className?.includes("task-list-item")) {
      return (
        <li className={cn("flex items-start gap-1 my-1.5 list-none", className)} {...props}>
          {children}
        </li>
      );
    }
    return <li className={className} {...props}>{children}</li>;
  };

  const sharedInputOverride = ({ type, checked, ...props }: any) => {
    if (type === "checkbox") return <TaskCheckbox defaultChecked={!!checked} />;
    return <input type={type} {...props} />;
  };

  // ── User message ────────────────────────────────────────────────────────────

  if (isUser) {
    return (
      <div className="group w-full flex justify-end pr-1 sm:pr-1.5">
        <div className="flex items-start gap-2.5 md:gap-3 max-w-[85%] sm:max-w-[75%] flex-row-reverse">
          <div className="flex-shrink-0 mt-0.5">
            <UserAvatar />
          </div>
          <div className="flex flex-col items-end max-w-full">
            <div className="w-fit max-w-full rounded-[28px] rounded-tr-[2px] bg-violet-600/10 dark:bg-violet-500/20 border border-violet-500/25 dark:border-violet-500/35 px-5 py-3 shadow-xs">
              <div className="prose prose-sm dark:prose-invert max-w-none break-words text-sm leading-relaxed text-foreground">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    pre: ({ children }) => <>{children}</>,
                    code: sharedCodeOverride,
                    li: sharedLiOverride,
                    input: sharedInputOverride,
                  }}
                >
                  {formatMarkdownContent(message.content)}
                </ReactMarkdown>
              </div>
            </div>

            {message.content && (
              <div
                className={cn(
                  "flex items-center gap-1 mt-1 pr-1 transition-opacity duration-200",
                  copied ? "opacity-100" : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                )}
              >
                {onEditPrompt && (
                  <button
                    onClick={() => onEditPrompt(message.content)}
                    className="text-muted-foreground hover:text-foreground transition p-1 rounded-md hover:bg-secondary/80 flex items-center gap-1 text-[11px] cursor-pointer"
                    title="Edit prompt"
                  >
                    <Pencil className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                )}
                <button
                  onClick={() => onCopy(message.content)}
                  className="text-muted-foreground hover:text-foreground transition p-1 rounded-md hover:bg-secondary/80 flex items-center gap-1 text-[11px] cursor-pointer"
                  title="Copy prompt"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-500 font-medium text-[11px]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Bot message ─────────────────────────────────────────────────────────────

  return (
    <div className="group w-full flex justify-start py-1">
      <div className="flex items-start gap-3 w-full">
        <div className="flex-shrink-0 mt-1">
          <BotAvatar />
        </div>

        <div className="flex flex-col items-start w-full min-w-0">
          {/* 1. TEXT / CONVERSATION */}
          {message.type !== "image" && message.type !== "audio" && message.type !== "video" && (
            <div className="w-full prose prose-sm dark:prose-invert max-w-none break-words text-sm leading-relaxed text-foreground/90">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  table: ({ children }) => <TableBlock>{children}</TableBlock>,
                  thead: ({ children }) => (
                    <thead className="bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 font-semibold border-b border-black/[0.06] dark:border-white/[0.08]">
                      {children}
                    </thead>
                  ),
                  tbody: ({ children }) => (
                    <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06]">
                      {children}
                    </tbody>
                  ),
                  tr: ({ children }) => (
                    <tr className="hover:bg-violet-500/[0.04] dark:hover:bg-violet-500/[0.07] transition-colors">
                      {children}
                    </tr>
                  ),
                  th: ({ children }) => (
                    <th className="px-4 py-2.5 font-semibold text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm tracking-tight whitespace-nowrap">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-4 py-2.5 text-zinc-700 dark:text-zinc-300 text-xs sm:text-sm align-middle">
                      {children}
                    </td>
                  ),
                  a: ({ href, children, ...props }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-violet-600 dark:text-violet-400 hover:text-violet-500 dark:hover:text-violet-300 underline underline-offset-2 font-medium transition-colors cursor-pointer"
                      {...props}
                    >
                      <span>{children}</span>
                      <ExternalLink className="w-3 h-3 opacity-70 shrink-0" />
                    </a>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="relative my-3.5 pl-4 pr-3 py-2 border-l-4 border-violet-500/80 bg-violet-500/[0.05] dark:bg-violet-500/[0.08] rounded-r-xl text-foreground/90 italic text-sm">
                      {children}
                    </blockquote>
                  ),
                  li: sharedLiOverride,
                  input: sharedInputOverride,
                  pre: ({ children }) => <>{children}</>,
                  code: sharedCodeOverride,
                }}
              >
                {formatMarkdownContent(message.content)}
              </ReactMarkdown>
            </div>
          )}

          {/* 2. IMAGE RENDERING */}
          {message.type === "image" && rawMediaUrl && (
            <div className="space-y-2">
              {message.content && (
                <p className="text-xs text-muted-foreground italic mb-2">&ldquo;{message.content}&rdquo;</p>
              )}
              <div className="relative group/img rounded-xl overflow-hidden border border-border/80 bg-zinc-950 aspect-square w-72 sm:w-80 md:w-96 max-w-full shadow-md">
                <Image
                  src={rawMediaUrl}
                  alt="Generated photo"
                  fill
                  className="object-cover transition duration-300 group-hover/img:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end justify-between p-3 sm:p-4 gap-2">
                  <button
                    onClick={() => onCopyMedia(rawMediaUrl, "image")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-md text-white text-xs font-medium hover:bg-white/30 transition shadow cursor-pointer"
                    title="Copy image"
                  >
                    {copiedMedia === "image" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-medium">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                  <a
                    href={rawMediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 backdrop-blur-md text-white text-xs font-medium hover:bg-white/30 transition shadow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download 8K
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* 3. AUDIO / MUSIC RENDERING */}
          {message.type === "audio" && rawMediaUrl && (
            <AudioPlayerCard
              rawMediaUrl={rawMediaUrl}
              content={message.content}
              duration={message.duration}
              modelUsed={message.modelUsed}
              onCopyMedia={onCopyMedia}
              copiedMedia={copiedMedia}
            />
          )}

          {/* 4. VIDEO RENDERING */}
          {message.type === "video" && rawMediaUrl && (
            <div className="space-y-3 w-80 sm:w-96 md:w-[480px] max-w-full">
              {message.content && (
                <p className="text-xs text-muted-foreground italic">&ldquo;{message.content}&rdquo;</p>
              )}
              <div className="rounded-xl overflow-hidden border border-border/80 bg-zinc-950 shadow-md">
                <video src={rawMediaUrl} controls playsInline className="w-full aspect-video object-cover" />
                <div className="p-2.5 bg-secondary/30 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Film className="w-3.5 h-3.5 text-orange-400" />
                    720p HD Cinematic (24fps)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onCopyMedia(rawMediaUrl, "video")}
                      className="flex items-center gap-1 text-xs text-foreground/80 hover:text-foreground font-medium transition cursor-pointer px-1.5 py-0.5 rounded hover:bg-secondary/60"
                      title="Copy video link"
                    >
                      {copiedMedia === "video" ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-500">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                    <a
                      href={rawMediaUrl}
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
            </div>
          )}

          {/* Action Bar */}
          {(message.content || message.mediaUrl) && (
            <div
              className={cn(
                "flex items-center gap-1 mt-1.5 transition-opacity duration-200",
                copied ? "opacity-100" : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
              )}
            >
              <button
                onClick={onCopyAll}
                className="text-muted-foreground hover:text-foreground transition p-1 rounded-md hover:bg-secondary/80 flex items-center gap-1 text-[11px] cursor-pointer"
                title="Copy entire response"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span className="text-emerald-500 font-medium text-[11px]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              {message.content && (
                <button
                  onClick={onToggleReadAloud}
                  className={cn(
                    "text-muted-foreground hover:text-foreground transition p-1 rounded-md hover:bg-secondary/80 flex items-center gap-1 text-[11px] cursor-pointer",
                    isSpeaking && "text-violet-500 hover:text-violet-600 bg-violet-500/10 font-medium"
                  )}
                  title={isSpeaking ? "Stop reading" : "Read aloud"}
                >
                  {isSpeaking ? (
                    <>
                      <Square className="w-3 h-3 fill-current text-violet-500 animate-pulse" />
                      <span className="text-violet-500 text-[11px]">Stop</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3 h-3" />
                      <span>Read</span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};