/**
 * Canonical ChatMessage type shared across UI components, hooks, and stores.
 *
 * Rule: All files that need this type MUST import from "@/lib/types".
 * Neither a component (omnimodal-message.tsx) nor a hook (use-generation-store.ts)
 * should be the source of truth for a shared domain type.
 */
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
