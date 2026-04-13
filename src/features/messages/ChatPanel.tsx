
import React from 'react';
import { Profile } from '@/data/profiles';
import { Message } from './types';
import { MessageInput } from './MessageInput';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { ChatHeader } from './components/ChatHeader';
import { ChatMessages } from './components/ChatMessages';
import { EmptyChat } from './components/EmptyChat';

type ChatPanelProps = {
  conversationPartner: Profile | undefined;
  setMobileViewChat: (view: boolean) => void;
  conversationMessages: Message[];
  userId?: string;
  handlePhoneCall: () => void;
  handleVideoCall: () => void;
  handleViewProfile: () => void;
  newMessage: string;
  setNewMessage: (message: string) => void;
  handleSendMessage: (e: React.FormEvent) => void;
};

export const ChatPanel = ({
  conversationPartner,
  setMobileViewChat,
  conversationMessages,
  userId,
  _handlePhoneCall,
  _handleVideoCall,
  _handleViewProfile,
  newMessage,
  setNewMessage,
  handleSendMessage
}: ChatPanelProps) => {
  const navigate = useNavigate();
  const { isPremium } = useAuth();

  const handlePhoneCallClick = () => {
    if (!isPremium) {
      toast.error("Phone calling is only available for premium members", {
        description: "Upgrade your account to access phone calling features",
        action: {
          label: "Upgrade",
          onClick: () => navigate('/plans'),
        },
      });
      return;
    }
    
    if (conversationPartner) {
      navigate(`/call/${conversationPartner.id}`);
      toast.success(`Initiating phone call with ${conversationPartner.name}`);
    }
  };

  const handleVideoCallClick = () => {
    if (!isPremium) {
      toast.error("Video calling is only available for premium members", {
        description: "Upgrade your account to access video calling features",
        action: {
          label: "Upgrade",
          onClick: () => navigate('/plans'),
        },
      });
      return;
    }
    
    if (conversationPartner) {
      navigate(`/video-call/${conversationPartner.id}`);
      toast.success(`Starting video call with ${conversationPartner.name}`);
    }
  };

  const handleViewProfileClick = () => {
    if (conversationPartner) {
      navigate(`/profile/${conversationPartner.id}`);
      toast.success(`Viewing ${conversationPartner.name}'s profile`);
    }
  };

  if (!conversationPartner) {
    return <EmptyChat />;
  }

  return (
    <>
      <ChatHeader
        conversationPartner={conversationPartner}
        setMobileViewChat={setMobileViewChat}
        onPhoneCall={handlePhoneCallClick}
        onVideoCall={handleVideoCallClick}
        onViewProfile={handleViewProfileClick}
      />
      
      <ChatMessages
        conversationMessages={conversationMessages}
        conversationPartner={conversationPartner}
        userId={userId}
      />
      
      <MessageInput 
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSendMessage={handleSendMessage}
      />
    </>
  );
};
