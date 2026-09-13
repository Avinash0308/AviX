"use client";

import { useState, useRef, useEffect } from "react";
import { Copy, Check, Code2, GitFork, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

/**
 * Global cache and sequential execution queue for Mermaid.
 *
 * Mermaid.js DOM rendering is a singleton — concurrent renders corrupt each
 * other's output. The queue ensures only one render runs at a time.
 *
 * Moving these to module scope (rather than component state) lets the cache
 * survive component unmount/remount and navigation within the SPA.
 *
 * TODO (medium): cap at 50 entries with an LRU eviction policy.
 */
export const globalMermaidSvgCache = new Map<string, string>();
let mermaidRenderQueue = Promise.resolve<any>(undefined);

/**
 * Sanitizes Mermaid chart definitions to auto-quote labels that contain
 * characters Mermaid's grammar would otherwise choke on (parens, colons,
 * commas, slashes, quotes). Also converts bare arrow labels to pipe-arrow
 * syntax and strips trailing semicolons from style directives.
 */
export function sanitizeMermaid(chart: string): string {
  if (!chart) return "";
  const lines = chart.split("\n");
  return lines
    .map((line) => {
      let l = line;
      l = l.replace(/(?:^|\s+)--\s+(.+?)\s+-->\s*/g, " -->|$1| ");
      l = l.replace(/(?:^|\s+)--\s+(.+?)\s+---\s*/g, " ---|$1| ");
      l = l.replace(/;\s*$/, "");
      l = l.replace(/([a-zA-Z0-9_-]+)\[([^\]\n]+)\]/g, (m, id, label) => {
        const trimmed = label.trim();
        if (trimmed.startsWith('"') && trimmed.endsWith('"')) return m;
        if (/[():,"/]/.test(trimmed)) {
          return `${id}["${trimmed.replace(/"/g, "'")}"]`;
        }
        return m;
      });
      l = l.replace(/([a-zA-Z0-9_-]+)\{([^}\n]+)\}/g, (m, id, label) => {
        const trimmed = label.trim();
        if (trimmed.startsWith('"') && trimmed.endsWith('"')) return m;
        if (/[():,"/?]/.test(trimmed)) {
          return `${id}{"${trimmed.replace(/"/g, "'")}"}`;
        }
        return m;
      });
      l = l.replace(/([a-zA-Z0-9_-]+)\(([^)\n]+)\)/g, (m, id, label) => {
        const trimmed = label.trim();
        if (trimmed.startsWith('"') && trimmed.endsWith('"')) return m;
        if (/[:,"/]/.test(trimmed)) {
          return `${id}("${trimmed.replace(/"/g, "'")}") `;
        }
        return m;
      });
      return l;
    })
    .join("\n");
}

export const MermaidBlock = ({ chart }: { chart: string }) => {
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
          // antiscript strips <script> tags and event-handler attributes (onclick,
          // onerror, etc.) from the SVG — prevents XSS without the iframe overhead of "strict".
          securityLevel: "antiscript",
          fontFamily: "inherit",
          suppressErrorRendering: true,
        });

        let renderedSvg = "";
        try {
          const res = await mermaid.render(renderId, sanitized);
          renderedSvg = res.svg;
        } catch (firstErr) {
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
        if (isMounted) setStatus("error");
      })
      .finally(() => {
        if (typeof document !== "undefined") {
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
            <div dangerouslySetInnerHTML={{ __html: svg }} className="w-full flex justify-center" />
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
