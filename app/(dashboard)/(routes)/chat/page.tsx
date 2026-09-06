import { OmnimodalChat } from "@/components/omnimodal-chat";

interface ChatPageProps {
  searchParams?: {
    id?: string;
  };
}

const ChatPage = ({ searchParams }: ChatPageProps) => {
  return (
    <div className="h-full">
      <OmnimodalChat />
    </div>
  );
};

export default ChatPage;
