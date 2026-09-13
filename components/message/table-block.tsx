"use client";

import { useState, useRef } from "react";
import { Copy, Check, Table } from "lucide-react";

export const TableBlock = ({ children }: { children: React.ReactNode }) => {
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
      <div ref={containerRef} className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          {children}
        </table>
      </div>
    </div>
  );
};
