"use client";

import { useState } from "react";
import { Copy, Check, Download, Volume2 } from "lucide-react";

export interface AudioPlayerCardProps {
  rawMediaUrl: string;
  content?: string;
  duration?: number;
  modelUsed?: string;
  onCopyMedia: (url: string, type: "image" | "audio" | "video") => void | Promise<void>;
  copiedMedia: string | null;
}

export const AudioPlayerCard = ({
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
    modelUsed?.toLowerCase().includes("preview") ||
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
            if (dur && !isNaN(dur) && dur > 0) setExactDuration(dur);
          }}
        />
      </div>
    </div>
  );
};
