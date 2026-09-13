import { create } from "zustand";
import axios from "axios";
import type { ChatMessage } from "@/lib/types";
import { useChatSyncStore } from "@/hooks/use-chat-sync-store";

export interface ActiveTask {
  chatId: string;
  prompt: string;
  loadingStatus: string;
  startTime: number;
  userMessage: ChatMessage;
}

interface GenerationStore {
  activeTasks: Record<string, ActiveTask>;
  startTask: (task: ActiveTask) => void;
  clearTask: (chatId: string) => void;
  finishTask: (chatId: string) => void;
  removeTask: (chatId: string) => void;
  executeGeneration: (params: {
    chatId: string;
    prompt: string;
    userMessage: ChatMessage;
    loadingStatus: string;
    onSuccess?: (assistantMessage: ChatMessage, title?: string) => void;
    onProModal?: () => void;
    onError?: (msg: string) => void;
  }) => Promise<void>;
}

export const useGenerationStore = create<GenerationStore>((set, get) => ({
  activeTasks: {},

  startTask: (task) =>
    set((state) => ({
      activeTasks: { ...state.activeTasks, [task.chatId]: task },
    })),

  clearTask: (chatId) =>
    set((state) => {
      const { [chatId]: _, ...remainingTasks } = state.activeTasks;
      return { activeTasks: remainingTasks };
    }),

  finishTask: (chatId) => get().clearTask(chatId),
  removeTask: (chatId) => get().clearTask(chatId),

  executeGeneration: async ({
    chatId,
    prompt,
    userMessage,
    loadingStatus,
    onSuccess,
    onProModal,
    onError,
  }) => {
    // Register task globally so it persists even if user navigates to other chats
    get().startTask({
      chatId,
      prompt,
      loadingStatus,
      startTime: Date.now(),
      userMessage,
    });

    const sync = useChatSyncStore.getState();

    try {
      const response = await axios.post("/api/chat", {
        prompt,
        conversationId: chatId,
      });

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.data.content || "",
        type: response.data.type || "text",
        mediaUrl: response.data.mediaUrl,
        modelUsed: response.data.modelUsed,
        duration: response.data.duration,
        createdAt: new Date(),
      };

      get().clearTask(chatId);

      // Primary: call the inline callback (handles the case where user is
      // still on this chat and the closure is live)
      onSuccess?.(assistantMessage, response.data?.title);

      // Secondary: push to the sync store so the chat window can consume
      // the result even if the user navigated away and came back
      sync.setTaskResult(chatId, {
        status: "completed",
        assistantMessage,
        title: response.data?.title,
      });

      // Signal the sidebar to refresh its history list
      sync.bumpHistory();
    } catch (error: any) {
      get().clearTask(chatId);

      if (error?.response?.status === 403) {
        onProModal?.();
      } else {
        const msg =
          error?.response?.data || "Something went wrong. Please try again.";
        onError?.(typeof msg === "string" ? msg : JSON.stringify(msg));
      }

      // Push failure to sync store so the active chat can clear its loading state
      sync.setTaskResult(chatId, { status: "failed" });
      // Still bump history (e.g. to remove a partially-created conversation from the list)
      sync.bumpHistory();
    }
  },
}));
