import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ChatHeader } from '@/features/messages/components/ChatHeader';
import { Messages } from '@/features/messages/components/Messages';
import { MessageComposer } from '@/features/messages/components/MessageComposer';
import { useConversations } from '@/features/messages/hooks/useConversations';

interface MessagesPageProps {
  receiverId?: string;
}

const MessagesPage: React.FC<MessagesPageProps> = ({ receiverId = '' }) => {
  const { user, loading } = useAuth();
  const { conversations, isLoading: conversationsLoading } = useConversations();

  // Mock router functionality
  const navigateBack = () => {
    // In a real app, this would use router.push('/messages')
    window.history.back();
  };

  // Get or create conversation when receiverId is available
  const [conversation, setConversation] = React.useState<{ id: string } | null>(null);
  const [isLoadingConversation, setIsLoadingConversation] = React.useState(false);

  useEffect(() => {
    // Mock conversation creation
    if (receiverId && user) {
      setIsLoadingConversation(true);
      // Simulate API call
      setTimeout(() => {
        setConversation({ id: `conv_${user.id}_${receiverId}` });
        setIsLoadingConversation(false);
      }, 500);
    }
  }, [receiverId, user]);

  // Handle navigation back to conversations list
  const handleBack = () => {
    navigateBack();
  };

  // Handle phone and video calls (placeholder functionality)
  const handlePhoneCall = () => {
    if (!receiverId) return;
    alert(`Initiating phone call with user ${receiverId}`);
    // Implement actual call functionality here
  };

  const handleVideoCall = () => {
    if (!receiverId) return;
    alert(`Initiating video call with user ${receiverId}`);
    // Implement actual call functionality here
  };

  // Loading state
  if (loading || !user || !receiverId || isLoadingConversation) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-8 w-8 border-4 border-t-transparent border-gray-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden">
      {/* Page title would go here in a real Next.js app */}
      
      {/* Chat header with user info and actions */}
      <ChatHeader 
        receiverId={receiverId}
        onBack={handleBack}
        onPhoneCall={handlePhoneCall}
        onVideoCall={handleVideoCall}
      />

      {/* Messages area */}
      {conversation ? (
        <Messages 
          conversationId={conversation.id}
          receiverId={receiverId}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Failed to load conversation</p>
        </div>
      )}

      {/* Message composer */}
      {conversation && (
        <MessageComposer 
          conversationId={conversation.id}
          receiverId={receiverId}
        />
      )}
    </div>
  );
};

export default MessagesPage; 