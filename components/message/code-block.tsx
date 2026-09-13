"use client";

import { useState } from "react";
import { Copy, Check, Code2 } from "lucide-react";
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

function getLanguageGrammar(lang?: string) {
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
}

export const CodeBlock = ({ language, code }: { language?: string; code: string }) => {
  const [copied, setCopied] = useState(false);

  const onCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const { grammar, langKey } = getLanguageGrammar(language);
  let highlightedHtml = "";
  try {
    if (grammar) highlightedHtml = Prism.highlight(code, grammar, langKey);
  } catch {
    highlightedHtml = "";
  }

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
      <div className="px-4 pb-4 pt-1 overflow-x-auto font-mono text-[13px] leading-relaxed">
        <pre className="!bg-transparent !p-0 !m-0 !border-0 font-mono text-[13px] text-inherit leading-relaxed">
          {highlightedHtml ? (
            <code className="code-highlight" dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
          ) : (
            <code>{code}</code>
          )}
        </pre>
      </div>
    </div>
  );
};
