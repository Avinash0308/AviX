"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  Send,
  Sparkles,
  Loader2,
  Trash2,
  MoreHorizontal,
  Copy,
  Download,
  Pencil,
  Check,
  X,
} from "lucide-react";

import { useProModal } from "@/hooks/use-pro-modal";
import { useGenerationStore } from "@/hooks/use-generation-store";
import { OmnimodalEmpty } from "@/components/omnimodal-empty";
import { OmnimodalMessage, ChatMessage } from "@/components/omnimodal-message";
import { BotAvatar } from "@/components/bot-avatar";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const OmnimodalChat = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeChatId = searchParams?.get("id");
  const proModal = useProModal();

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const editFormRef = useRef<HTMLFormElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatTitle, setChatTitle] = useState("New Conversation");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitleText, setEditingTitleText] = useState("");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("Genius.ai is thinking...");
  const [isLoadingChat, setIsLoadingChat] = useState(() => !!activeChatId);
  const [placeholderText, setPlaceholderText] = useState("Ask anything or create media...");
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const newlyCreatedChatIdRef = useRef<string | null>(null);
  const currentChatIdRef = useRef<string | null | undefined>(activeChatId);

  const handleScroll = useCallback(() => {
    setIsScrolling(true);
    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
    }
    scrollTimerRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const updatePlaceholder = () => {
      if (typeof window !== "undefined" && window.innerWidth >= 640) {
        setPlaceholderText("Ask anything, write code, or create images, music & video...");
      } else {
        setPlaceholderText("Ask anything or create media...");
      }
    };
    updatePlaceholder();
    window.addEventListener("resize", updatePlaceholder);
    return () => window.removeEventListener("resize", updatePlaceholder);
  }, []);

  useEffect(() => {
    currentChatIdRef.current = activeChatId;
  }, [activeChatId]);

  // Load conversation messages when activeChatId changes
  useEffect(() => {
    // If this conversation was just initiated in the current view, do not wipe messages or fetch from server
    if (activeChatId && newlyCreatedChatIdRef.current === activeChatId) {
      newlyCreatedChatIdRef.current = null;
      setIsLoadingChat(false);
      return;
    }

    // 1. Check if the newly active chat has a task currently generating in the background
    const runningTask = activeChatId
      ? useGenerationStore.getState().activeTasks[activeChatId]
      : undefined;

    // Immediately isolate state: if this chat is actively generating, show its user message & loading card
    setMessages(runningTask ? [runningTask.userMessage] : []);
    setInput("");
    setIsLoading(!!runningTask);
    if (runningTask) {
      setLoadingStatus(runningTask.loadingStatus);
    }
    setIsEditingTitle(false);
    setEditingTitleText("");
    setChatTitle(activeChatId ? "" : "New Conversation");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    if (!activeChatId) {
      setIsLoadingChat(false);
      return;
    }

    // If generation is actively in progress, message is already in state and server hasn't finished yet.
    // Do NOT make a premature GET request that would 404.
    if (runningTask) {
      setIsLoadingChat(false);
      return;
    }

    const abortController = new AbortController();
    setIsLoadingChat(true);

    axios
      .get(`/api/chat/${activeChatId}`, { signal: abortController.signal })
      .then((response) => {
        // Guard against race conditions where user switched chats before fetch finished
        if (currentChatIdRef.current !== activeChatId) return;

        if (response.data) {
          if (response.data.title) {
            setChatTitle(response.data.title);
          }
          if (response.data.messages) {
            setMessages(response.data.messages as ChatMessage[]);
          }
        }
      })
      .catch((error) => {
        if (axios.isCancel(error) || error?.name === "CanceledError" || abortController.signal.aborted) {
          return;
        }
        if (currentChatIdRef.current === activeChatId) {
          console.error("[LOAD_CHAT_ERROR]", error);
          if (error?.response?.status === 404) {
            // Chat does not exist or was deleted, smoothly reset to clean /chat
            router.replace("/chat");
            return;
          }
          toast.error("Could not load chat.");
        }
      })
      .finally(() => {
        if (currentChatIdRef.current === activeChatId) {
          setIsLoadingChat(false);
        }
      });

    return () => {
      abortController.abort();
    };
  }, [activeChatId, router]);

  // Listen for global background task completion/failure
  useEffect(() => {
    const handleTaskCompleted = (e: Event) => {
      const { chatId, assistantMessage, title } = (e as CustomEvent).detail;
      if (chatId === currentChatIdRef.current) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === assistantMessage.id)) return prev;
          return [...prev, assistantMessage];
        });
        setIsLoading(false);
        if (title) {
          setChatTitle(title);
        }
      }
    };

    const handleTaskFailed = (e: Event) => {
      const { chatId } = (e as CustomEvent).detail;
      if (chatId === currentChatIdRef.current) {
        setIsLoading(false);
      }
    };

    window.addEventListener("task-completed", handleTaskCompleted);
    window.addEventListener("task-failed", handleTaskFailed);
    return () => {
      window.removeEventListener("task-completed", handleTaskCompleted);
      window.removeEventListener("task-failed", handleTaskFailed);
    };
  }, []);

  // Listen for "new-chat-clicked" event from sidebar
  useEffect(() => {
    const handleNewChat = () => {
      setMessages([]);
      setChatTitle("New Conversation");
      setInput("");
      setIsLoading(false);
      setIsLoadingChat(false);
      setIsEditingTitle(false);
      setEditingTitleText("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    };

    window.addEventListener("new-chat-clicked", handleNewChat);
    return () => window.removeEventListener("new-chat-clicked", handleNewChat);
  }, []);

  // Auto-scroll to bottom whenever messages update or loading starts
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Adjust textarea height dynamically
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        180
      )}px`;
    }
  };

  const startEditingTitle = () => {
    setEditingTitleText(chatTitle);
    setIsEditingTitle(true);
    setTimeout(() => {
      if (titleInputRef.current) {
        titleInputRef.current.focus();
        titleInputRef.current.select();
      }
    }, 120);
  };

  const handleSaveTitle = useCallback(async () => {
    const trimmed = editingTitleText.trim();
    setIsEditingTitle(false);
    if (!trimmed || trimmed === chatTitle) return;

    setChatTitle(trimmed);

    if (activeChatId) {
      try {
        await axios.patch(`/api/chat/${activeChatId}`, { title: trimmed });
        toast.success("Chat renamed");
        window.dispatchEvent(new CustomEvent("chat-history-updated"));
      } catch (error) {
        toast.error("Failed to rename chat");
      }
    }
  }, [editingTitleText, chatTitle, activeChatId]);

  // Click outside to commit title edit cleanly
  useEffect(() => {
    if (!isEditingTitle) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (editFormRef.current && !editFormRef.current.contains(e.target as Node)) {
        handleSaveTitle();
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 120);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditingTitle, handleSaveTitle]);

  const handleCopyConversation = async () => {
    if (messages.length === 0) return;
    const formatted = messages
      .map((m) => {
        const role = m.role === "user" ? "You" : "Genius";
        let content = m.content || "";
        if (m.mediaUrl) {
          content += `\n[Media]: ${m.mediaUrl}`;
        }
        return `### ${role}\n${content}`;
      })
      .join("\n\n---\n\n");

    try {
      await navigator.clipboard.writeText(formatted);
      toast.success("Conversation copied to clipboard");
    } catch {
      toast.error("Failed to copy conversation");
    }
  };

  const handleExportMarkdown = () => {
    if (messages.length === 0) return;
    const formatted = messages
      .map((m) => {
        const role = m.role === "user" ? "You" : "Genius";
        let content = m.content || "";
        if (m.mediaUrl) {
          content += `\n\n![Generated Media](${m.mediaUrl})`;
        }
        return `## ${role}\n\n${content}`;
      })
      .join("\n\n---\n\n");

    const header = `# ${chatTitle || "Conversation"}\n*Exported from Genius.ai on ${new Date().toLocaleDateString()}*\n\n---\n\n`;
    const fullMarkdown = header + formatted;

    const blob = new Blob([fullMarkdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeFilename = (chatTitle || "conversation")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    link.href = url;
    link.download = `${safeFilename || "chat"}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Exported as Markdown");
  };

  const [isDeleting, setIsDeleting] = useState(false);

  const handleClearChat = async () => {
    if (messages.length === 0 || isDeleting) return;
    if (!confirm("Delete this conversation?")) return;

    if (activeChatId) {
      setIsDeleting(true);
      try {
        await axios.delete(`/api/chat/${activeChatId}`);
        toast.success("Chat deleted");
        setMessages([]);
        window.dispatchEvent(new CustomEvent("chat-history-updated"));
        router.push("/chat");
      } catch (error) {
        toast.error("Failed to delete chat.");
      } finally {
        setIsDeleting(false);
      }
    } else {
      setMessages([]);
      toast.success("Conversation cleared");
    }
  };

  const onSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const prompt = input.trim();
    if (!prompt || isLoading) return;

    // Determine loading status based on prompt intent preview
    const lower = prompt.toLowerCase();
    let status = "Thinking and generating response...";
    if (lower.includes("video") || lower.includes("animate")) {
      status = "Rendering cinematic video...";
    } else if (lower.includes("music") || lower.includes("song") || lower.includes("beat")) {
      status = "Composing studio audio track...";
    } else if (lower.includes("photo") || lower.includes("draw") || lower.includes("picture") || lower.includes("image")) {
      status = "Synthesizing high-resolution image...";
    } else if (lower.includes("code") || lower.includes("function") || lower.includes("script")) {
      status = "Generating production code...";
    }
    setLoadingStatus(status);

    // If activeChatId exists, use it. Otherwise, pre-generate a unique conversation ID
    const targetChatId =
      activeChatId || `c${Math.random().toString(36).substring(2, 11)}${Date.now().toString(36)}`;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: prompt,
      type: "text",
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setIsLoading(true);

    // If starting from a new conversation, track that it was initiated locally
    if (!activeChatId) {
      newlyCreatedChatIdRef.current = targetChatId;
      currentChatIdRef.current = targetChatId;
    }

    // Execute via global store so it NEVER stops even if user switches chats!
    useGenerationStore.getState().executeGeneration({
      chatId: targetChatId,
      prompt,
      userMessage,
      loadingStatus: status,
      onSuccess: (assistantMessage, title) => {
        if (currentChatIdRef.current === targetChatId) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === assistantMessage.id)) return prev;
            return [...prev, assistantMessage];
          });
          setIsLoading(false);
          if (title) {
            setChatTitle(title);
          }
          router.refresh();
        }
      },
      onProModal: () => proModal.onOpen(),
      onError: (msg) => toast.error(msg),
    });

    // Update URL so this chat has a solid ID
    if (!activeChatId) {
      router.push(`/chat?id=${targetChatId}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto px-2 md:px-6 relative">
      {/* Top Header Bar: Conversation Title on Left + 3-Dot Dropdown on Right */}
      {messages.length > 0 && (
        <div className="flex items-center justify-between py-2 px-1 border-b border-border/40 shrink-0 mb-1">
          {/* Left: Chat Title (Click/Pencil to Rename) */}
          <div className="flex items-center gap-2 min-w-0 flex-1 pr-3">
            {isEditingTitle ? (
              <form
                ref={editFormRef}
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveTitle();
                }}
                className="flex items-center gap-1.5 w-full max-w-sm"
              >
                <input
                  ref={titleInputRef}
                  value={editingTitleText}
                  onChange={(e) => setEditingTitleText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      e.preventDefault();
                      setIsEditingTitle(false);
                    }
                  }}
                  className="px-2.5 py-1 text-sm font-semibold bg-secondary/90 border border-violet-500/50 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/30 w-full"
                />
                <button
                  type="submit"
                  className="p-1.5 text-zinc-400 hover:text-green-500 hover:bg-green-500/10 rounded-md transition cursor-pointer"
                  title="Save title (Enter)"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingTitle(false)}
                  className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-md transition cursor-pointer"
                  title="Cancel (Esc)"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={startEditingTitle}
                disabled={isLoadingChat}
                className="group flex items-center gap-1.5 rounded-lg px-2 py-1 hover:bg-secondary/60 transition max-w-full text-left cursor-pointer disabled:pointer-events-none"
                title="Click to rename"
              >
                {isLoadingChat ? (
                  <div className="h-5 w-28 bg-secondary/80 animate-pulse rounded-md my-0.5" />
                ) : (
                  <>
                    <span className="text-sm font-semibold text-foreground/90 truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                      {chatTitle || "Conversation"}
                    </span>
                    <Pencil className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </>
                )}
              </button>
            )}
          </div>

          {/* Right: Sleek 3-Dot Dropdown Menu */}
          <div className="flex items-center shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-all cursor-pointer border border-transparent hover:border-border/50"
                  title="More options"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onCloseAutoFocus={(e) => e.preventDefault()}
                className="w-52 p-1.5 shadow-xl backdrop-blur-xl bg-popover/95 border-border/60"
              >
                <DropdownMenuItem
                  onClick={handleCopyConversation}
                  className="cursor-pointer text-xs flex items-center gap-2.5 py-2 rounded-lg"
                >
                  <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Copy conversation</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={startEditingTitle}
                  className="cursor-pointer text-xs flex items-center gap-2.5 py-2 rounded-lg"
                >
                  <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Rename chat</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleExportMarkdown}
                  className="cursor-pointer text-xs flex items-center gap-2.5 py-2 rounded-lg"
                >
                  <Download className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Export as Markdown</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1 border-border/40" />

                <DropdownMenuItem
                  onClick={handleClearChat}
                  disabled={isDeleting}
                  className="cursor-pointer text-xs flex items-center gap-2.5 py-2 rounded-lg text-red-500 focus:text-red-500 focus:bg-red-500/10 dark:focus:bg-red-500/20"
                >
                  {isDeleting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>Delete conversation</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      {/* Main Message Stream */}
      <div
        onScroll={handleScroll}
        className={cn(
          "flex-1 min-h-0 pl-1 pr-3 sm:pr-4 md:pr-6",
          isScrolling && "is-scrolling",
          messages.length > 0
            ? "overflow-y-auto py-2 space-y-4"
            : "overflow-y-auto no-scrollbar flex flex-col justify-start md:justify-center py-2"
        )}
      >
        {isLoadingChat || (activeChatId && messages.length === 0) ? (
          <div className="flex flex-col items-center justify-center h-64 gap-2.5 text-muted-foreground text-sm">
            <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
            <span className="text-xs font-medium text-muted-foreground">Loading conversation...</span>
          </div>
        ) : messages.length === 0 ? (
          <OmnimodalEmpty onSelectPrompt={(p) => setInput(p)} />
        ) : (
          messages.map((message) => (
            <OmnimodalMessage key={message.id} message={message} />
          ))
        )}

        {/* Dynamic Loading State Card */}
        {!isLoadingChat && isLoading && (
          <div className="w-full flex justify-start">
            <div className="flex items-start gap-2.5 md:gap-3 max-w-[92%] sm:max-w-[85%]">
              <div className="flex-shrink-0 mt-0.5">
                <BotAvatar />
              </div>
              <div className="w-fit flex items-center gap-3 px-4 py-3 rounded-2xl rounded-tl-xs bg-card dark:bg-zinc-900/90 border border-border/80 shadow-sm animate-pulse">
                <Loader2 className="w-4 h-4 text-violet-500 animate-spin shrink-0" />
                <span className="text-xs md:text-sm font-medium text-muted-foreground">
                  {loadingStatus}
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Floating Omnimodal Prompt Input Bar */}
      <div className="pt-2 pb-3 shrink-0 bg-gradient-to-t from-background via-background to-transparent">
        {/* Input Box Container */}
        <form
          onSubmit={onSubmit}
          className="relative flex items-end rounded-2xl border border-border/80 bg-background/80 backdrop-blur-xl shadow-lg focus-within:border-violet-500/60 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all p-2 gap-2"
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={placeholderText}
            className="flex-1 max-h-44 resize-none bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 placeholder:truncate focus:outline-none leading-relaxed"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${!input.trim() || isLoading
                ? "bg-secondary text-muted-foreground cursor-not-allowed opacity-50"
                : "bg-gradient-to-tr from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white shadow-md shadow-violet-500/30 cursor-pointer hover:scale-105 active:scale-95"
              }`}
            title="Send prompt"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>

        <div className="flex items-center justify-between mt-2 px-2 text-[10px] sm:text-[11px] text-muted-foreground">
          <span className="truncate pr-2">Next-generation multi-modal AI studio</span>
          <span className="hidden sm:inline shrink-0">Shift + Enter for new line</span>
        </div>
      </div>
    </div>
  );
};
