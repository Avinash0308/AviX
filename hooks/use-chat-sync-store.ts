import { create } from "zustand";
import type { ChatMessage } from "@/lib/types";

/**
 * Represents the result of a background generation task once it settles.
 */
export interface TaskResult {
  status: "completed" | "failed";
  assistantMessage?: ChatMessage;
  title?: string;
}

/**
 * Cross-component synchronisation store.
 *
 * Replaces the window.dispatchEvent() event bus that previously connected
 * the sidebar, the chat window, and the generation store. Using a Zustand store
 * gives us:
 *  - Full TypeScript type-safety on all payloads
 *  - Testability (no global window needed)
 *  - Predictable subscription semantics (no fire-and-forget)
 *
 * Consumers:
 *  - historyVersion  → sidebar.tsx subscribes to trigger fetchHistory()
 *  - newChatSignal   → omnimodal-chat.tsx subscribes to reset chat state
 *  - taskResults     → omnimodal-chat.tsx subscribes to display completed tasks
 */
interface ChatSyncStore {
  /** Increments on every history mutation; sidebar re-fetches when this changes. */
  historyVersion: number;
  /** Increments when the user requests a new chat; chat window resets when this changes. */
  newChatSignal: number;
  /** Settled task results keyed by chatId, consumed and cleared by the chat window. */
  taskResults: Record<string, TaskResult>;

  bumpHistory: () => void;
  triggerNewChat: () => void;
  setTaskResult: (chatId: string, result: TaskResult) => void;
  clearTaskResult: (chatId: string) => void;
}

export const useChatSyncStore = create<ChatSyncStore>((set) => ({
  historyVersion: 0,
  newChatSignal: 0,
  taskResults: {},

  bumpHistory: () => set((s) => ({ historyVersion: s.historyVersion + 1 })),
  triggerNewChat: () => set((s) => ({ newChatSignal: s.newChatSignal + 1 })),

  setTaskResult: (chatId, result) =>
    set((s) => ({ taskResults: { ...s.taskResults, [chatId]: result } })),

  clearTaskResult: (chatId) =>
    set((s) => {
      const { [chatId]: _removed, ...rest } = s.taskResults;
      return { taskResults: rest };
    }),
}));
