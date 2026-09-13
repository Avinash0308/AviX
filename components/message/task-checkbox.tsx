"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Interactive task list checkbox — can be toggled by the user after generation.
 * Rendered by the markdown `input[type=checkbox]` override in ReactMarkdown.
 */
export const TaskCheckbox = ({ defaultChecked = false }: { defaultChecked?: boolean }) => {
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
