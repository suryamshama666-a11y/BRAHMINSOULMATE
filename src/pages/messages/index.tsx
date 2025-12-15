import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useConversations } from '@/features/messages/hooks/useConversations';
import { ConversationList } from '@/features/messages/components/ConversationList';
import { ChatBox } from '@/features/messages/components/ChatBox';

// Define a simplified conversation type for this component
interface ConversationItem {
  id: string;
  partner_id: string;
  partner_name: string;
  partner_avatar?: string;
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string;
    read: boolean;
  };
  unread_count: number;
}

const MessagesIndexPage: React.FC = () => {
  const { user, loading } = useAuth();
  const { conversations: rawConversations, isLoading } = useConversations();
  const [selectedConversation, setSelectedConversation] = useState<ConversationItem | null>(null);
  
  // Transform conversations to match our simplified type
  const conversations: ConversationItem[] = rawConversations.map(conv => ({
    id: conv.id,
    partner_id: conv.partner_id || '',
    partner_name: conv.partner_profile?.name || 'Unknown User',
    partner_avatar: conv.partner_profile?.profile_image,
    last_message: conv.last_message ? {
      content: conv.last_message.content || '',
      created_at: conv.last_message.created_at || new Date().toISOString(),
      sender_id: conv.last_message.sender_id || '',
      read: !!conv.last_message.read_at
    } : undefined,
    unread_count: conv.unread_count || 0
  }));

  // Handle conversation selection
  const handleSelectConversation = (conversationId: string) => {
    const conv = conversations.find(c => c.id === conversationId);
    if (conv) {
      setSelectedConversation(conv);
    }
  };

  const handleBack = () => {
    setSelectedConversation(null);
  };

  // Loading state
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-8 w-8 border-4 border-t-transparent border-orange-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar with conversations list */}
      <div className={`${selectedConversation ? 'hidden md:block' : 'block'} w-full md:w-80 lg:w-96 border-r border-gray-200 bg-white`}>
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-orange-500 to-amber-500">
          <h1 className="text-2xl font-bold text-white">Messages</h1>
          <p className="text-sm text-white/80">Connect with your matches</p>
        </div>
        
        <ConversationList
          conversations={conversations}
          selectedConversation={selectedConversation?.id || null}
          onSelect={handleSelectConversation}
        />
      </div>

      {/* Chat area */}
      <div className={`${selectedConversation ? 'flex' : 'hidden md:flex'} flex-col flex-1`}>
        {selectedConversation ? (
          <ChatBox
            conversationId={selectedConversation.id}
            partnerId={selectedConversation.partner_id}
            partnerName={selectedConversation.partner_name}
            partnerAvatar={selectedConversation.partner_avatar}
            onBack={handleBack}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-gradient-to-b from-orange-50 to-amber-50">
            {isLoading ? (
              <div className="h-8 w-8 border-4 border-t-transparent border-orange-500 rounded-full animate-spin"></div>
            ) : conversations.length === 0 ? (
              <div className="text-center p-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 text-white mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No conversations yet</h3>
                <p className="text-gray-500 max-w-xs mb-4">
                  Start connecting with potential matches to begin conversations
                </p>
                <button 
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-full font-medium shadow-lg hover:shadow-xl transition-all"
                  onClick={() => window.location.href = '/discover'}
                >
                  Discover Matches
                </button>
              </div>
            ) : (
              <div className="text-center p-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-orange-400 to-amber-400 text-white mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-500 max-w-xs">
                  Choose a conversation from the list to start messaging
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesIndexPage;