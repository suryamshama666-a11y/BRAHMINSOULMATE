import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useConversations } from '@/features/messages/hooks/useConversations';
import { ConversationList } from '@/features/messages/components/ConversationList';

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
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  
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
    setSelectedConversation(conversationId);
    // In a real app with routing, this would navigate to the conversation page
    // router.push(`/messages/${conversationId}`);
    
    // For demo purposes, we'll just update the URL without a page reload
    window.history.pushState({}, '', `/messages/${conversationId}`);
  };

  // Loading state
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-8 w-8 border-4 border-t-transparent border-gray-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar with conversations list */}
      <div className="w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">Messages</h1>
          <p className="text-sm text-gray-500">Connect with your matches</p>
        </div>
        
        <ConversationList
          conversations={conversations}
          selectedConversation={selectedConversation}
          onSelect={handleSelectConversation}
        />
      </div>

      {/* Empty state or placeholder when no conversation is selected */}
      <div className="hidden md:flex flex-col flex-1 items-center justify-center bg-gray-50">
        {isLoading ? (
          <div className="h-8 w-8 border-4 border-t-transparent border-gray-500 rounded-full animate-spin"></div>
        ) : conversations.length === 0 ? (
          <div className="text-center p-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-1">No conversations yet</h3>
            <p className="text-gray-500">
              Start connecting with potential matches to begin conversations
            </p>
            <button 
              className="mt-4 px-4 py-2 bg-gradient-to-r from-red-500 to-amber-500 text-white rounded-md shadow-sm hover:shadow-md transition-all"
              onClick={() => window.location.href = '/discover'}
            >
              Discover Matches
            </button>
          </div>
        ) : (
          <div className="text-center p-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Select a conversation</h3>
            <p className="text-gray-500">
              Choose a conversation from the list to start messaging
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesIndexPage; 