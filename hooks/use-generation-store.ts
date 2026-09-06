import { create } from "zustand";
import axios from "axios";
import { ChatMessage } from "@/components/omnimodal-message";

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

  finishTask: (chatId) =>
    set((state) => {
      const { [chatId]: _, ...remainingTasks } = state.activeTasks;
      return { activeTasks: remainingTasks };
    }),

  removeTask: (chatId) =>
    set((state) => {
      const { [chatId]: _, ...remainingTasks } = state.activeTasks;
      return { activeTasks: remainingTasks };
    }),

  executeGeneration: async ({
    chatId,
    prompt,
    userMessage,
    loadingStatus,
    onSuccess,
    onProModal,
    onError,
  }) => {
    // 1. Register task globally so it persists even if user navigates to other chats
    get().startTask({
      chatId,
      prompt,
      loadingStatus,
      startTime: Date.now(),
      userMessage,
    });

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

      get().finishTask(chatId);

      onSuccess?.(assistantMessage, response.data?.title);

      // Dispatch global events so sidebar and chat windows react seamlessly
      window.dispatchEvent(
        new CustomEvent("task-completed", {
          detail: {
            chatId,
            assistantMessage,
            title: response.data?.title,
          },
        })
      );
      window.dispatchEvent(new CustomEvent("chat-history-updated"));
    } catch (error: any) {
      get().removeTask(chatId);
      if (error?.response?.status === 403) {
        onProModal?.();
      } else {
        const msg =
          error?.response?.data || "Something went wrong. Please try again.";
        onError?.(typeof msg === "string" ? msg : JSON.stringify(msg));
      }

      window.dispatchEvent(
        new CustomEvent("task-failed", {
          detail: { chatId, error },
        })
      );
      window.dispatchEvent(new CustomEvent("chat-history-updated"));
    }
  },
}));
