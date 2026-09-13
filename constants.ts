import { Code, ImageIcon, MessageSquare, Music, VideoIcon } from "lucide-react";

export const MAX_FREE_COUNTS = 5;
export const DEFAULT_LOADING_STATUS = "Genius.ai is thinking...";
export const DEFAULT_CHAT_TITLE = "New Conversation";

export const MESSAGE_TYPES = {
  CONVERSATION: "conversation",
  CODE: "code",
  IMAGE: "image",
  MUSIC: "music",
  VIDEO: "video",
} as const;

export type MessageType = (typeof MESSAGE_TYPES)[keyof typeof MESSAGE_TYPES];

export const tools = [
  {
    label: 'Conversation',
    icon: MessageSquare,
    href: '/chat',
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
  },
  {
    label: 'Music Generation',
    icon: Music,
    href: '/chat',
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    label: 'Image Generation',
    icon: ImageIcon,
    color: "text-pink-700",
    bgColor: "bg-pink-700/10",
    href: '/chat',
  },
  {
    label: 'Video Generation',
    icon: VideoIcon,
    color: "text-orange-700",
    bgColor: "bg-orange-700/10",
    href: '/chat',
  },
  {
    label: 'Code Generation',
    icon: Code,
    color: "text-green-700",
    bgColor: "bg-green-700/10",
    href: '/chat',
  },
];
