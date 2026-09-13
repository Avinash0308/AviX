"use client";

import { useState, useRef, useEffect } from "react";
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
  VolumeX,
  Square,
  Film,
  Pencil,
  Code2,
  Table,
  ExternalLink,
  GitFork,
  Loader2,
} from "lucide-react";
import { useTheme } from "next-themes";
import Prism from "prismjs";
import "prismjs/components/prism-python";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-css";
import "prismjs/components/prism-json";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-yaml";

import { BotAvatar } from "@/components/bot-avatar";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";

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
  onEditPrompt?: (prompt: string) => void;
}

const CodeBlock = ({ language, code }: { language?: string; code: string }) => {
  const [copied, setCopied] = useState(false);

  const onCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLanguageGrammar = (lang?: string) => {
    const l = (lang || "").toLowerCase().trim();
    if (!l) return { grammar: Prism.languages.javascript, langKey: "javascript" };
    if (l === "py" || l === "python") return { grammar: Prism.languages.python, langKey: "python" };
    if (l === "js" || l === "javascript") return { grammar: Prism.languages.javascript, langKey: "javascript" };
    if (l === "ts" || l === "typescript") return { grammar: Prism.languages.typescript, langKey: "typescript" };
    if (l === "tsx") return { grammar: Prism.languages.tsx, langKey: "tsx" };
    if (l === "jsx") return { grammar: Prism.languages.jsx, langKey: "jsx" };
    if (l === "sh" || l === "bash" || l === "shell") return { grammar: Prism.languages.bash, langKey: "bash" };
    if (l === "sql") return { grammar: Prism.languages.sql, langKey: "sql" };
    if (l === "json") return { grammar: Prism.languages.json, langKey: "json" };
    if (l === "css") return { grammar: Prism.languages.css, langKey: "css" };
    return { grammar: Prism.languages[l] || Prism.languages.clike || Prism.languages.javascript, langKey: l };
  };

  const { grammar, langKey } = getLanguageGrammar(language);
  let highlightedHtml = "";
  try {
    if (grammar) {
      highlightedHtml = Prism.highlight(code, grammar, langKey);
    }
  } catch {
    highlightedHtml = "";
  }

  // Format capitalized display name (e.g. Python, TypeScript, JavaScript)
  const displayLang = language
    ? language.toLowerCase() === "js"
      ? "JavaScript"
      : language.toLowerCase() === "ts"
      ? "TypeScript"
      : language.toLowerCase() === "py"
      ? "Python"
      : language.charAt(0).toUpperCase() + language.slice(1)
    : "Code";

  return (
    <div className="relative my-3.5 w-full rounded-2xl bg-[#f3f4f6] dark:bg-[#1c1d22] border border-black/[0.04] dark:border-white/[0.06] shadow-xs overflow-hidden">
      {/* Top Bar matching reference image: </> Language on left, Copy icon on right */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2 text-xs font-mono select-none">
        <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-semibold">
          <Code2 className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          <span className="text-[13px] tracking-tight">{displayLang}</span>
        </div>

        <button
          onClick={onCopyCode}
          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer"
          title="Copy code"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Code Body with syntax highlighting */}
      <div className="px-4 pb-4 pt-1 overflow-x-auto font-mono text-[13px] leading-relaxed">
        <pre className="!bg-transparent !p-0 !m-0 !border-0 font-mono text-[13px] text-inherit leading-relaxed">
          {highlightedHtml ? (
            <code
              className="code-highlight"
              dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            />
          ) : (
            <code>{code}</code>
          )}
        </pre>
      </div>
    </div>
  );
};

/**
 * Normalizes Markdown content so tables render properly without mutating valid tables.
 */
function formatMarkdownContent(raw: string): string {
  if (!raw) return "";
  // Only if the table was flattened without newlines (e.g., | col | | --- |)
  if (!raw.includes("\n|") && raw.includes("| |")) {
    return raw.replace(/\|\s*\|\s*/g, "|\n|");
  }
  return raw;
}

const TableBlock = ({ children }: { children: React.ReactNode }) => {
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const onCopyTable = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (containerRef.current) {
      const rows = Array.from(containerRef.current.querySelectorAll("tr"));
      const tsv = rows
        .map((row) =>
          Array.from(row.querySelectorAll("th, td"))
            .map((cell) => cell.textContent?.trim() || "")
            .join("\t")
        )
        .join("\n");
      navigator.clipboard.writeText(tsv);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative my-4 w-full rounded-2xl bg-[#f8f9fa] dark:bg-[#16171c] border border-black/[0.08] dark:border-white/[0.08] shadow-xs overflow-hidden">
      {/* Table Top Bar with Copy Table Button */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-black/[0.03] dark:bg-white/[0.03] border-b border-black/[0.05] dark:border-white/[0.06] text-xs font-medium select-none">
        <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-semibold">
          <Table className="w-4 h-4 text-violet-500" />
          <span className="text-[12px] tracking-tight">Table</span>
        </div>
        <button
          onClick={onCopyTable}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
          title="Copy table as TSV (ready to paste into Excel or Sheets)"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-500 font-medium text-xs">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-xs">Copy table</span>
            </>
          )}
        </button>
      </div>

      {/* Scrollable Table Viewport */}
      <div ref={containerRef} className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          {children}
        </table>
      </div>
    </div>
  );
};

/**
 * Interactive task list checkbox that can be clicked to check or uncheck.
 */
const TaskCheckbox = ({ defaultChecked = false }: { defaultChecked?: boolean }) => {
  const [checked, setChecked] = useState(defaultChecked);

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setChecked((prev) => !prev);
      }}
      className={cn(
        "inline-flex items-center justify-center w-4 h-4 mr-2.5 rounded-[5px] transition-all cursor-pointer select-none align-middle flex-shrink-0 mt-0.5 active:scale-90",
        checked
          ? "bg-violet-600 dark:bg-violet-500 text-white shadow-xs hover:bg-violet-700 dark:hover:bg-violet-600"
          : "border-2 border-zinc-400 dark:border-zinc-500 hover:border-violet-500 dark:hover:border-violet-400 bg-black/5 dark:bg-white/5"
      )}
      title={checked ? "Click to uncheck" : "Click to check"}
    >
      {checked && <Check className="w-3 h-3 stroke-[3]" />}
    </button>
  );
};

/**
 * Global cache and sequential execution queue for Mermaid.
 * Mermaid.js DOM rendering is a singleton and will conflict if multiple renders run concurrently.
 */
const globalMermaidSvgCache = new Map<string, string>();
let mermaidRenderQueue = Promise.resolve<any>(undefined);

/**
 * Sanitizes Mermaid chart definitions to automatically quote unquoted labels
 * containing parentheses, colons, commas, or quotes so Mermaid grammar won't throw syntax errors.
 * Also converts bare arrows like `A -- label --> B` to pipe arrows `A -->|label| B`
 * and strips trailing semicolons from style directives.
 */
function sanitizeMermaid(chart: string): string {
  if (!chart) return "";
  let lines = chart.split("\n");
  return lines
    .map((line) => {
      let l = line;

      // 1. Convert labeled arrows: A -- label --> B or A -- label --- B
      // Matches any label even if it contains hyphens (e.g., /protected-resource), slashes, colons
      l = l.replace(/(?:^|\s+)--\s+(.+?)\s+-->\s*/g, " -->|$1| ");
      l = l.replace(/(?:^|\s+)--\s+(.+?)\s+---\s*/g, " ---|$1| ");

      // 2. Remove trailing semicolons (e.g., in style declarations or node definitions)
      l = l.replace(/;\s*$/, "");

      // 3. Quote square brackets: A[Any text with (parens), "quotes", : colons, / slashes]
      l = l.replace(/([a-zA-Z0-9_-]+)\[([^\]\n]+)\]/g, (m, id, label) => {
        const trimmed = label.trim();
        if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
          return m;
        }
        if (/[():,"/]/.test(trimmed)) {
          const clean = trimmed.replace(/"/g, "'");
          return `${id}["${clean}"]`;
        }
        return m;
      });

      // 4. Quote curly braces: B{Any text with (parens), "quotes", or : colons?}
      l = l.replace(/([a-zA-Z0-9_-]+)\{([^}\n]+)\}/g, (m, id, label) => {
        const trimmed = label.trim();
        if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
          return m;
        }
        if (/[():,"/?]/.test(trimmed)) {
          const clean = trimmed.replace(/"/g, "'");
          return `${id}{"${clean}"}`;
        }
        return m;
      });

      // 5. Quote rounded parens: C(Any text with "quotes", etc)
      l = l.replace(/([a-zA-Z0-9_-]+)\(([^)\n]+)\)/g, (m, id, label) => {
        const trimmed = label.trim();
        if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
          return m;
        }
        if (/[:,"/]/.test(trimmed)) {
          const clean = trimmed.replace(/"/g, "'");
          return `${id}("${clean}")`;
        }
        return m;
      });

      return l;
    })
    .join("\n");
}

const MermaidBlock = ({ chart }: { chart: string }) => {
  const { resolvedTheme } = useTheme();
  const [svg, setSvg] = useState<string>(() => {
    const sanitized = sanitizeMermaid(chart.trim());
    return (
      globalMermaidSvgCache.get(`dark-${sanitized}`) ||
      globalMermaidSvgCache.get(`default-${sanitized}`) ||
      ""
    );
  });
  const [status, setStatus] = useState<"rendering" | "success" | "error">(
    svg ? "success" : "rendering"
  );
  const [activeTab, setActiveTab] = useState<"diagram" | "code">("diagram");
  const [copied, setCopied] = useState(false);
  const componentId = useRef(`mmd-${Math.random().toString(36).substring(2, 9)}`);

  useEffect(() => {
    let isMounted = true;
    const sanitized = sanitizeMermaid(chart.trim());
    const theme = resolvedTheme === "dark" ? "dark" : "default";
    const cacheKey = `${theme}-${sanitized}`;

    if (globalMermaidSvgCache.has(cacheKey)) {
      setSvg(globalMermaidSvgCache.get(cacheKey)!);
      setStatus("success");
      return;
    }

    const renderId = `${componentId.current}-${Date.now()}`;
    setStatus("rendering");

    // Queue Mermaid renders sequentially to prevent DOM collisions
    mermaidRenderQueue = mermaidRenderQueue
      .then(async () => {
        if (!isMounted) return;

        if (globalMermaidSvgCache.has(cacheKey)) {
          if (isMounted) {
            setSvg(globalMermaidSvgCache.get(cacheKey)!);
            setStatus("success");
          }
          return;
        }

        const m = await import("mermaid");
        const mermaid = m.default;
        mermaid.initialize({
          startOnLoad: false,
          theme,
          securityLevel: "loose",
          fontFamily: "inherit",
          suppressErrorRendering: true,
        });

        let renderedSvg = "";
        try {
          const res = await mermaid.render(renderId, sanitized);
          renderedSvg = res.svg;
        } catch (firstErr) {
          // Fallback pass: strip style directives if syntax error occurred
          const fallbackChart = sanitized
            .split("\n")
            .filter((l) => !l.trim().startsWith("style "))
            .join("\n");

          if (fallbackChart !== sanitized) {
            console.warn("[Mermaid] First pass failed, trying fallback without style lines...");
            const res = await mermaid.render(`${renderId}-fb`, fallbackChart);
            renderedSvg = res.svg;
          } else {
            throw firstErr;
          }
        }

        if (renderedSvg && isMounted) {
          globalMermaidSvgCache.set(cacheKey, renderedSvg);
          setSvg(renderedSvg);
          setStatus("success");
        }
      })
      .catch((err) => {
        console.warn("[Mermaid] Render failed:", err);
        if (isMounted) {
          setStatus("error");
        }
      })
      .finally(() => {
        if (typeof document !== "undefined") {
          // Clean up ONLY Mermaid's temporary scratchpad elements in document.body
          document
            .querySelectorAll(`#d${renderId}, #d${renderId}-fb, [id*='dmermaid']`)
            .forEach((el) => el.remove());
        }
      });

    return () => {
      isMounted = false;
      if (typeof document !== "undefined") {
        document
          .querySelectorAll(`#d${renderId}, #d${renderId}-fb, [id*='dmermaid']`)
          .forEach((el) => el.remove());
      }
    };
  }, [chart, resolvedTheme]);

  const onCopyChart = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(chart);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-4 w-full rounded-2xl bg-[#f8f9fa] dark:bg-[#16171c] border border-black/[0.08] dark:border-white/[0.08] shadow-xs overflow-hidden">
      {/* Top Action Bar with Tabs & Copy Button */}
      <div className="flex items-center justify-between px-3.5 sm:px-4 py-2 bg-black/[0.03] dark:bg-white/[0.03] border-b border-black/[0.05] dark:border-white/[0.06] text-xs font-medium select-none gap-2">
        <div className="flex items-center gap-2">
          <GitFork className="w-4 h-4 text-violet-500 shrink-0" />
          <span className="text-[12px] font-semibold text-zinc-800 dark:text-zinc-200 tracking-tight">
            Mermaid Diagram
          </span>
          {status === "error" && (
            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-md border border-amber-500/20">
              Source Available
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Tab Switcher: Diagram / Code */}
          <div className="flex items-center bg-black/5 dark:bg-white/5 rounded-lg p-0.5 border border-black/[0.04] dark:border-white/[0.06]">
            <button
              type="button"
              onClick={() => setActiveTab("diagram")}
              className={cn(
                "px-2.5 py-1 text-[11px] font-medium rounded-md transition-all flex items-center gap-1 cursor-pointer",
                activeTab === "diagram"
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              )}
            >
              <GitFork className="w-3 h-3" />
              Diagram
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("code")}
              className={cn(
                "px-2.5 py-1 text-[11px] font-medium rounded-md transition-all flex items-center gap-1 cursor-pointer",
                activeTab === "code"
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              )}
            >
              <Code2 className="w-3 h-3" />
              Code
            </button>
          </div>

          {/* Copy Button */}
          <button
            type="button"
            onClick={onCopyChart}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
            title="Copy Mermaid source code"
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
      </div>

      {/* Content Area */}
      {activeTab === "diagram" ? (
        <div className="w-full overflow-x-auto p-4 sm:p-6 flex justify-center items-center min-h-[160px] [&>svg]:max-w-full [&>svg]:h-auto">
          {status === "rendering" ? (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
              Rendering diagram...
            </div>
          ) : status === "error" ? (
            <div className="flex flex-col items-center justify-center gap-2 p-6 text-center">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <GitFork className="w-4 h-4" />
              </div>
              <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Diagram syntax could not be rendered automatically.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("code")}
                className="text-[11px] text-violet-600 dark:text-violet-400 hover:underline cursor-pointer"
              >
                View Mermaid Code
              </button>
            </div>
          ) : svg ? (
            <div
              dangerouslySetInnerHTML={{ __html: svg }}
              className="w-full flex justify-center"
            />
          ) : null}
        </div>
      ) : (
        <div className="p-4 sm:p-5 font-mono text-xs overflow-x-auto leading-relaxed bg-[#f3f4f6] dark:bg-[#121316] text-zinc-800 dark:text-zinc-200">
          {status === "error" && (
            <div className="mb-3 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2">
              <span>Diagram preview unavailable due to syntax. Displaying source code:</span>
            </div>
          )}
          <pre className="!bg-transparent !p-0 !m-0 !border-0 font-mono text-[13px] text-inherit leading-relaxed">
            <code>{chart}</code>
          </pre>
        </div>
      )}
    </div>
  );
};

interface AudioPlayerCardProps {
  rawMediaUrl: string;
  content?: string;
  duration?: number;
  modelUsed?: string;
  onCopyMedia: (url: string, type: "image" | "audio" | "video") => void | Promise<void>;
  copiedMedia: string | null;
}

const AudioPlayerCard = ({
  rawMediaUrl,
  content,
  duration,
  modelUsed,
  onCopyMedia,
  copiedMedia,
}: AudioPlayerCardProps) => {
  const [exactDuration, setExactDuration] = useState<number | null>(null);

  const displayDuration = exactDuration !== null ? exactDuration : duration;
  const isPreview =
    modelUsed?.toLowerCase().includes("riffusion") ||
    (exactDuration !== null && exactDuration <= 6 && (duration || 0) > 8);

  return (
    <div className="space-y-3 w-72 sm:w-80 md:w-96 max-w-full">
      {content && (
        <p className="text-xs text-muted-foreground italic">&ldquo;{content}&rdquo;</p>
      )}
      <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-foreground">
                  {isPreview ? "AI Audio Preview" : "Studio Music Track"}
                </span>
                {isPreview && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-mono">
                    Preview Loop
                  </span>
                )}
              </div>
              <span className="block text-[10px] text-muted-foreground">
                {displayDuration ? `${displayDuration} seconds` : "Audio generated"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onCopyMedia(rawMediaUrl, "audio")}
              className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-400 transition cursor-pointer"
              title="Copy audio link"
            >
              {copiedMedia === "audio" ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            <a
              href={rawMediaUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-400 transition"
              title="Download track"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
        </div>

        <audio
          src={rawMediaUrl}
          className="w-full h-10 mt-1"
          controls
          onLoadedMetadata={(e) => {
            const dur = Math.round(e.currentTarget.duration);
            if (dur && !isNaN(dur) && dur > 0) {
              setExactDuration(dur);
            }
          }}
        />
      </div>
    </div>
  );
};

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

    // Clean markdown syntax for natural speech flow
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
            await navigator.clipboard.write([
              new ClipboardItem({ "image/png": blob }),
            ]);
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
                  await navigator.clipboard.write([
                    new ClipboardItem({ "image/png": pngBlob }),
                  ]);
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
          // Fallback to writing URL to clipboard
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
    if (message.content && message.content.trim()) {
      parts.push(message.content.trim());
    }
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

  if (isUser) {
    return (
      <div className="group w-full flex justify-end pr-1 sm:pr-1.5">
        <div className="flex items-start gap-2.5 md:gap-3 max-w-[85%] sm:max-w-[75%] flex-row-reverse">
          {/* User Avatar */}
          <div className="flex-shrink-0 mt-0.5">
            <UserAvatar />
          </div>

          {/* User Message Column */}
          <div className="flex flex-col items-end max-w-full">
            {/* User Content Bubble */}
            <div className="w-fit max-w-full rounded-[28px] rounded-tr-[2px] bg-violet-600/10 dark:bg-violet-500/20 border border-violet-500/25 dark:border-violet-500/35 px-5 py-3 shadow-xs">
              <div className="prose prose-sm dark:prose-invert max-w-none break-words text-sm leading-relaxed text-foreground">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    pre: ({ children }) => <>{children}</>,
                    code: ({ node, inline, className, children, ...props }) => {
                      if (inline) {
                        return (
                          <code className="bg-secondary px-1.5 py-0.5 rounded-md font-mono text-xs" {...props}>
                            {children}
                          </code>
                        );
                      }
                      const match = /language-(\w+)/.exec(className || "");
                      const language = match ? match[1] : "";
                      const code = String(children).replace(/\n$/, "");
                      return <CodeBlock language={language} code={code} />;
                    },
                    li: ({ node, children, className, ...props }: any) => {
                      const isTaskList = className?.includes("task-list-item");
                      if (isTaskList) {
                        return (
                          <li className={cn("flex items-start gap-1 my-1.5 list-none", className)} {...props}>
                            {children}
                          </li>
                        );
                      }
                      return <li className={className} {...props}>{children}</li>;
                    },
                    input: ({ type, checked, ...props }: any) => {
                      if (type === "checkbox") {
                        return <TaskCheckbox defaultChecked={!!checked} />;
                      }
                      return <input type={type} {...props} />;
                    },
                  }}
                >
                  {formatMarkdownContent(message.content)}
                </ReactMarkdown>
              </div>
            </div>

            {/* Action Buttons Below User Bubble */}
            {message.content && (
              <div
                className={cn(
                  "flex items-center gap-1 mt-1 pr-1 transition-opacity duration-200",
                  copied ? "opacity-100" : "opacity-0 group-hover:opacity-100"
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

  return (
    <div className="group w-full flex justify-start py-1">
      <div className="flex items-start gap-3 w-full">
        {/* Bot Avatar */}
        <div className="flex-shrink-0 mt-1">
          <BotAvatar />
        </div>

        {/* Bot Message Column (Full Width, ChatGPT style) */}
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
                  li: ({ node, children, className, ...props }: any) => {
                    const isTaskList = className?.includes("task-list-item");
                    if (isTaskList) {
                      return (
                        <li className={cn("flex items-start gap-1 my-1.5 list-none", className)} {...props}>
                          {children}
                        </li>
                      );
                    }
                    return <li className={className} {...props}>{children}</li>;
                  },
                  input: ({ type, checked, ...props }: any) => {
                    if (type === "checkbox") {
                      return <TaskCheckbox defaultChecked={!!checked} />;
                    }
                    return <input type={type} {...props} />;
                  },
                  pre: ({ children }) => <>{children}</>,
                  code: ({ node, inline, className, children, ...props }) => {
                    if (inline) {
                      return (
                        <code className="bg-secondary px-1.5 py-0.5 rounded-md font-mono text-xs" {...props}>
                          {children}
                        </code>
                      );
                    }
                    const match = /language-(\w+)/.exec(className || "");
                    const language = match ? match[1] : "";
                    const code = String(children).replace(/\n$/, "");

                    if (language.toLowerCase() === "mermaid") {
                      return <MermaidBlock chart={code} />;
                    }

                    return <CodeBlock language={language} code={code} />;
                  },
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
                <video
                  src={rawMediaUrl}
                  controls
                  playsInline
                  className="w-full aspect-video object-cover"
                />
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

          {/* Action Bar Below Assistant Response (Copies entire response: text + media) */}
          {(message.content || message.mediaUrl) && (
            <div
              className={cn(
                "flex items-center gap-1 mt-1.5 transition-opacity duration-200",
                copied ? "opacity-100" : "opacity-0 group-hover:opacity-100"
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

              {/* Read Aloud Button */}
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